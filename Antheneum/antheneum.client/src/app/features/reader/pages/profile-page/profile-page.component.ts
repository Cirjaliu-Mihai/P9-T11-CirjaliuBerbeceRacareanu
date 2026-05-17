import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReadersService } from '../../../../core/services/readers.service';
import { ReadersStore } from '../../../../core/state/readers.store';
import { ProfileFormValue } from '../../../../models/reader/profile-form-value.model';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css',
  standalone: false,
})
export class ProfilePageComponent implements OnInit {
  readonly store = inject(ReadersStore);
  private readonly readersService = inject(ReadersService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);
  private readonly passwordPolicy = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

  isSaving = false;
  isChangingPassword = false;
  form!: FormGroup;

  ngOnInit() {
    this.initializeForm();
    if (this.store.currentProfile) {
      this.resetFromProfile();
      return;
    }

    this.readersService.getMyProfile().subscribe({
      next: (profile) => {
        this.store.currentProfile = profile;
        this.resetFromProfile();
      },
      error: () => {
        this.snackBar.open('Could not load your profile.', 'OK', { duration: 4000 });
      },
    });
  }

  private initializeForm() {
    this.form = this.fb.group(
      {
        phone: ['', [Validators.maxLength(20)]],
        address: ['', [Validators.maxLength(200)]],
        currentPassword: [''],
        confirmCurrentPassword: [''],
        newPassword: ['', [this.passwordStrengthValidator.bind(this)]],
      },
      { validators: this.passwordMatchValidator.bind(this) }
    );
  }

  private passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    if (!this.passwordPolicy.test(control.value)) {
      return { passwordStrength: true };
    }

    return null;
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    if (!this.isChangingPassword) {
      return null;
    }

    const currentPassword = control.get('currentPassword')?.value?.trim() || '';
    const confirmCurrentPassword = control.get('confirmCurrentPassword')?.value?.trim() || '';

    if (currentPassword && confirmCurrentPassword && currentPassword !== confirmCurrentPassword) {
      control.get('confirmCurrentPassword')?.setErrors({ passwordMismatch: true });
      return null;
    }

    if (confirmCurrentPassword && !currentPassword && currentPassword === confirmCurrentPassword) {
      control.get('confirmCurrentPassword')?.setErrors(null);
    }

    return null;
  }

  saveProfile() {
    if (this.isSaving) {
      return;
    }

    const currentPassword = this.form.get('currentPassword')?.value?.trim() || '';
    const confirmCurrentPassword = this.form.get('confirmCurrentPassword')?.value?.trim() || '';
    const newPassword = this.form.get('newPassword')?.value?.trim() || '';

    // Re-run the group validator to catch any mismatches
    this.form.updateValueAndValidity();

    if (newPassword && !currentPassword) {
      this.snackBar.open('Enter your current password to set a new password.', 'OK', {
        duration: 4500,
      });
      return;
    }

    if ((currentPassword || confirmCurrentPassword) && currentPassword !== confirmCurrentPassword) {
      this.snackBar.open('Current password confirmation does not match.', 'OK', {
        duration: 4500,
      });
      return;
    }

    if (newPassword && !this.passwordPolicy.test(newPassword)) {
      this.snackBar.open(
        'New password must be at least 8 characters and include an uppercase letter, a number and a special character.',
        'OK',
        { duration: 5000 },
      );
      return;
    }

    const payload: ProfileFormValue = {
      phone: this.form.get('phone')?.value || '',
      address: this.form.get('address')?.value || '',
      currentPassword: this.isChangingPassword ? currentPassword : '',
      newPassword: this.isChangingPassword ? newPassword : '',
    };

    this.isSaving = true;
    this.store.updateMyProfile(payload).subscribe({
      next: (profile) => {
        this.isSaving = false;
        this.store.currentProfile = profile;
        this.resetFromProfile();
        this.snackBar.open('Profile updated.', 'OK', { duration: 3200 });
      },
      error: (err) => {
        this.isSaving = false;
        this.snackBar.open(err?.error?.message ?? 'Could not update profile.', 'OK', {
          duration: 5000,
        });
      },
    });
  }

  togglePasswordChange() {
    this.isChangingPassword = !this.isChangingPassword;
    if (!this.isChangingPassword) {
      this.form.patchValue({
        currentPassword: '',
        confirmCurrentPassword: '',
        newPassword: '',
      });
      this.form.get('confirmCurrentPassword')?.setErrors(null);
    }
    this.form.updateValueAndValidity();
  }

  resetFromProfile() {
    const profile = this.store.currentProfile;
    this.form.patchValue({
      phone: profile?.phone ?? '',
      address: profile?.address ?? '',
      currentPassword: '',
      confirmCurrentPassword: '',
      newPassword: '',
    });
    this.isChangingPassword = false;
    this.form.get('confirmCurrentPassword')?.setErrors(null);
  }
}
