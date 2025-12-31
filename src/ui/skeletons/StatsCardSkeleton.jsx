import Card from "../cards/Card";
import Skeleton from "./Skeleton";

const StatsCardSkeleton = ({ count = 4 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="p-6">
          <Skeleton variant="text" className="mb-3 w-1/2" />
          <Skeleton variant="title" className="mb-2 w-1/3" />
          <Skeleton variant="text" className="w-2/3" />
        </Card>
      ))}
    </>
  );
};

export default StatsCardSkeleton;






