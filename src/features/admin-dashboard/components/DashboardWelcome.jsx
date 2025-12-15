import { getGreeting } from "../utils/formatDate";

const DashboardWelcome = ({ userName }) => {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl lg:text-4xl font-black text-charcoal-grey">
        {getGreeting()}, {userName.split(" ")[0]}! 👋
      </h1>
      <p className="text-charcoal-grey/70 text-lg">
        Welcome back to your MomoSewa admin portal
      </p>
    </div>
  );
};

export default DashboardWelcome;

