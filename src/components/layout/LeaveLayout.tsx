
import { Outlet } from 'react-router-dom';
import TitleHeader from './TitleHeader'

const LeaveLayout = () => {
  return (
    <main className="p-6 space-y-6">
      <TitleHeader
        title="Leave Management"
        description="Manage leave requests for all employees"
        link="/admin/dashboard"
      />
      <Outlet />
    </main>
  );
};

export default LeaveLayout;
