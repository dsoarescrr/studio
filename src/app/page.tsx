import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect to the main page of the application within the (main) group
  redirect('/?ref=root');
}
