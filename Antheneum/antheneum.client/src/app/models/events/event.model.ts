export interface Event {
  eventId: number;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  branchName: string;
  maxSeats: number;
  enrolledCount: number;
  coverImageUrl: string | null;
}

export interface EventDetail extends Event {
  branchId: number;
  isEnrolled: boolean;
}

export interface EventFormValue {
  eventId: number | null;
  title: string;
  description: string | null;
  branchId: number;
  startDate: string;
  endDate: string;
  maxSeats: number;
  coverImageUrl: string | null;
}

export interface EventAttendee {
  readerId: number;
  username: string;
  email: string;
  libraryCardNumber: string;
}
