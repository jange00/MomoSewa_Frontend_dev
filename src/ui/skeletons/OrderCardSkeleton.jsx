import Card from "../cards/Card";
import Skeleton from "./Skeleton";

const OrderCardSkeleton = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <Skeleton variant="heading" className="mb-2 w-1/3" />
              <Skeleton variant="text" className="mb-1 w-1/2" />
            </div>
            <Skeleton variant="text" className="w-20 h-6 rounded-full" />
          </div>
          <div className="space-y-3 mb-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton variant="image" className="w-16 h-16 rounded-lg" />
                <div className="flex-1">
                  <Skeleton variant="text" className="mb-1 w-3/4" />
                  <Skeleton variant="text" className="w-1/4" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-charcoal-grey/10">
            <Skeleton variant="text" className="w-24 h-5" />
            <Skeleton variant="button" />
          </div>
        </Card>
      ))}
    </>
  );
};

export default OrderCardSkeleton;










