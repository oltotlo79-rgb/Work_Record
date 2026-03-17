export interface Employee {
  id: string;
  employee_number: string;
  name: string;
  nfc_uid: string;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  updated_at: string;
}

export interface ViewingMember {
  id: string;
  viewer_id: string;
  target_employee_id: string;
  created_at: string;
}

export interface AttendanceWithEmployee extends AttendanceRecord {
  employees: Pick<Employee, 'employee_number' | 'name'>;
}
