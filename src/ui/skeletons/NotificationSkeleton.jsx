import Card from "../cards/Card";
import Skeleton from "./Skeleton";

const NotificationSkeleton = ({ count = 5 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-start gap-4">
            <Skeleton variant="avatar" className="w-12 h-12" />
            <div className="flex-1 space-y-2">
              <Skeleton variant="heading" className="w-3/4" />
              <Skeleton variant="text" className="w-full" />
              <Skeleton variant="text" className="w-2/3" />
              <Skeleton variant="text" className="w-1/4 h-3" />
            </div>
            <Skeleton variant="text" className="w-20 h-6 rounded-full" />
          </div>
        </Card>
      ))}
    </>
  );
};

export default NotificationSkeleton;


