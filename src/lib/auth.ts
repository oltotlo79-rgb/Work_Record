import { cookies } from 'next/headers';

export async function getLoggedInUser(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('employee_number')?.value ?? null;
}
