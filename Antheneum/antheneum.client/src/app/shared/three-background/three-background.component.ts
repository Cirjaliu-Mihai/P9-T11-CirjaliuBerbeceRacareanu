import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

@Component({
  selector: 'app-three-background',
  templateUrl: './three-background.component.html',
  styleUrl: './three-background.component.css',
  standalone: false,
})
export class ThreeBackgroundComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvasHost', { static: true }) private readonly canvasHost!: ElementRef<HTMLDivElement>;

  private readonly scene = new THREE.Scene();
  private readonly clock = new THREE.Clock();
  private readonly loader = new GLTFLoader();
  private readonly textureLoader = new THREE.TextureLoader();
  private readonly sceneGroup = new THREE.Group();
  private readonly placeholder = new THREE.Group();
  private readonly modelOffset = new THREE.Vector3();
  private camera?: THREE.PerspectiveCamera;
  private renderer?: THREE.WebGLRenderer;
  private resizeObserver?: ResizeObserver;
  private animationFrameId?: number;
  private loadedModel?: THREE.Object3D;
  private cameraDistance = 9;
  private focusY = 0.9;
  private readonly baseRotY = -0.45;
  private readonly baseRotX = -0.09;
  private targetRotY = 0;
  private targetRotX = 0;
  private currentRotY = 0;
  private currentRotX = 0;
  private mouseMoveHandler?: (e: MouseEvent) => void;

  constructor(private readonly zone: NgZone) {}

  ngAfterViewInit() {
    const host = this.canvasHost.nativeElement;

    this.initializeScene(host);
    this.createPlaceholder();
    void this.loadModel();

    this.zone.runOutsideAngular(() => {
      this.resizeScene();
      this.resizeObserver = new ResizeObserver(() => this.resizeScene());
      this.resizeObserver.observe(host);
      this.mouseMoveHandler = (e: MouseEvent) => {
        const nx = (e.clientX / window.innerWidth) * 2 - 1;
        const ny = (e.clientY / window.innerHeight) * 2 - 1;
        this.targetRotY = -nx * 0.35;
        this.targetRotX = ny * 0.15;
      };
      window.addEventListener('mousemove', this.mouseMoveHandler);
      this.animate();
    });
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.resizeObserver?.disconnect();
    if (this.mouseMoveHandler) {
      window.removeEventListener('mousemove', this.mouseMoveHandler);
    }
    this.disposeObject(this.loadedModel);
    this.disposeObject(this.placeholder);
    this.renderer?.dispose();
    this.renderer?.domElement.remove();
    this.scene.clear();
  }

  private initializeScene(host: HTMLDivElement) {
    this.scene.background = new THREE.Color(0xefe1c9);

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.01, 200);
    this.camera.position.set(0, 1.6, this.cameraDistance);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    host.appendChild(this.renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    this.sceneGroup.add(this.placeholder);
    this.scene.add(this.sceneGroup);
  }

  private createPlaceholder() {
    const spineGeometry = new THREE.BoxGeometry(0.34, 2.05, 1.24);
    const pageGeometry = new THREE.BoxGeometry(0.24, 1.9, 1.16);
    const palette = [0xc59f6b, 0x8e5f3a, 0x5f4b33, 0xb38552, 0x7a6242, 0xa56e49];

    Array.from({ length: 10 }, (_, index) => {
      const material = new THREE.MeshStandardMaterial({
        color: palette[index % palette.length],
        metalness: 0.05,
        roughness: 0.66,
      });

      const mesh = new THREE.Mesh(spineGeometry, material);
      const angle = (index / 10) * Math.PI * 2;
      const radius = 2.55;

      const page = new THREE.Mesh(
        pageGeometry,
        new THREE.MeshStandardMaterial({
          color: 0xf3e7d1,
          metalness: 0.02,
          roughness: 0.8,
        }),
      );
      page.position.set(0.14, 0, 0);
      mesh.add(page);

      mesh.position.set(Math.cos(angle) * radius, ((index % 4) - 1.5) * 0.58, Math.sin(angle) * 1.06);
      mesh.rotation.set(0.05 * ((index % 2) - 0.5), angle + Math.PI / 2, 0.06 * ((index % 3) - 1));
      this.placeholder.add(mesh);
    });

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(3.15, 0.07, 14, 80),
      new THREE.MeshStandardMaterial({
        color: 0xd2b48c,
        metalness: 0.04,
        roughness: 0.72,
      }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -1.3;
    this.placeholder.add(ring);
  }

  private async loadModel() {
    const errors: unknown[] = [];

    for (const url of ['/models/custom/model.gltf']) {
      try {
        const gltf = await this.loader.loadAsync(url);
        this.attachModel(gltf.scene);
        return;
      } catch (error) {
        errors.push(error);
      }
    }

    console.warn('Unable to load a custom 3D model from /models/custom/.', errors);
  }

  private attachModel(model: THREE.Object3D) {
    this.disposeObject(this.loadedModel);
    this.loadedModel = model;

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const largestSide = Math.max(size.x, size.y, size.z, 1);
    const scale = 5.8 / largestSide;

    model.scale.setScalar(scale);
    this.modelOffset.set(-center.x * scale, -center.y * scale, -center.z * scale);
    model.position.copy(this.modelOffset);

    const legacyDiffuseTexture = this.textureLoader.load('/models/custom/textures/material_diffuse.png');
    legacyDiffuseTexture.colorSpace = THREE.SRGBColorSpace;
    legacyDiffuseTexture.flipY = false;

    model.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;

        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const material of materials) {
          if (material instanceof THREE.MeshStandardMaterial && !material.map) {
            const specGlossExtension = material.userData?.['gltfExtensions']?.['KHR_materials_pbrSpecularGlossiness'];
            if (specGlossExtension?.diffuseTexture) {
              material.map = legacyDiffuseTexture;
              material.color.setRGB(0.52, 0.52, 0.52, THREE.LinearSRGBColorSpace);
              material.metalness = 0;
              material.roughness = 0.45;
              material.needsUpdate = true;
            }
          }
        }
      }
    });

    this.placeholder.visible = false;
    this.sceneGroup.add(model);

    this.cameraDistance = Math.max(2.5, largestSide * scale * 0.45);

    this.applyViewportLayout();
  }

  private resizeScene() {
    const host = this.canvasHost.nativeElement;
    const width = Math.max(host.clientWidth, 1);
    const height = Math.max(host.clientHeight, 1);

    if (!this.camera || !this.renderer) {
      return;
    }

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.applyViewportLayout();
  }

  private applyViewportLayout() {
    if (!this.camera) {
      return;
    }

    const hostWidth = this.canvasHost.nativeElement.clientWidth;
    const focusX = hostWidth >= 960 ? 3.8 : 0;

    this.sceneGroup.position.x = focusX;

    if (this.loadedModel) {
      this.loadedModel.position.copy(this.modelOffset);
      this.focusY = 0;
    } else {
      this.focusY = 0.9;
    }

    this.camera.position.set(focusX + this.cameraDistance * 0.25, this.cameraDistance * 0.2, this.cameraDistance);
    this.camera.lookAt(focusX, this.focusY, 0);
  }

  private disposeObject(object?: THREE.Object3D) {
    if (!object) {
      return;
    }

    object.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.geometry) {
        mesh.geometry.dispose();
      }

      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((material) => material.dispose());
      } else {
        mesh.material?.dispose();
      }
    });

    object.removeFromParent();
  }

  private animate = () => {
    if (!this.camera || !this.renderer) {
      return;
    }

    const elapsed = this.clock.getElapsedTime();

    if (!this.loadedModel) {
      this.placeholder.rotation.y = elapsed * 0.11;
      this.placeholder.rotation.x = Math.sin(elapsed * 0.28) * 0.025;
      this.placeholder.position.y = Math.sin(elapsed * 0.55) * 0.05;
    }

    const lerpFactor = 0.04;
    this.currentRotY += (this.targetRotY - this.currentRotY) * lerpFactor;
    this.currentRotX += (this.targetRotX - this.currentRotX) * lerpFactor;
    this.sceneGroup.rotation.y = this.baseRotY + this.currentRotY;
    this.sceneGroup.rotation.x = this.baseRotX + this.currentRotX;

    this.renderer.render(this.scene, this.camera);
    this.animationFrameId = requestAnimationFrame(this.animate);
  };
}
