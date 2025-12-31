import Card from "../cards/Card";
import Skeleton from "./Skeleton";

const AnalyticsSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <Skeleton variant="text" className="mb-3 w-1/2" />
            <Skeleton variant="title" className="mb-2 w-1/3" />
            <Skeleton variant="text" className="w-2/3" />
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <Skeleton variant="heading" className="mb-4 w-1/3" />
          <Skeleton variant="image" className="w-full h-64" />
        </Card>
        <Card className="p-6">
          <Skeleton variant="heading" className="mb-4 w-1/3" />
          <Skeleton variant="image" className="w-full h-64" />
        </Card>
      </div>

      {/* Product Performance */}
      <Card className="p-6">
        <Skeleton variant="heading" className="mb-4 w-1/3" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton variant="text" className="w-1/3" />
              <Skeleton variant="text" className="w-1/4" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsSkeleton;




