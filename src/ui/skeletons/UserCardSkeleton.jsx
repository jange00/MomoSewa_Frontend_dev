import Card from "../cards/Card";
import Skeleton from "./Skeleton";

const UserCardSkeleton = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="p-6 border-l-4 border-l-deep-maroon/20">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1">
              {/* Avatar Skeleton */}
              <Skeleton variant="avatar" className="w-14 h-14 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <Skeleton variant="heading" className="mb-2 w-3/4" />
                <Skeleton variant="text" className="w-20 h-5 rounded-lg" />
              </div>
            </div>
            {/* Status Badge Skeleton */}
            <Skeleton variant="text" className="w-16 h-6 rounded-lg flex-shrink-0" />
          </div>
          
          <div className="space-y-2.5 mb-4 pb-4 border-b border-charcoal-grey/10">
            {/* Email */}
            <div className="flex items-center gap-2">
              <Skeleton variant="image" className="w-8 h-8 rounded-lg flex-shrink-0" />
              <Skeleton variant="text" className="flex-1 h-4" />
            </div>
            {/* Phone */}
            <div className="flex items-center gap-2">
              <Skeleton variant="image" className="w-8 h-8 rounded-lg flex-shrink-0" />
              <Skeleton variant="text" className="w-32 h-4" />
            </div>
            {/* Date */}
            <div className="flex items-center gap-2">
              <Skeleton variant="image" className="w-8 h-8 rounded-lg flex-shrink-0" />
              <Skeleton variant="text" className="w-24 h-4" />
            </div>
          </div>
          
          {/* Buttons */}
          <div className="flex gap-2">
            <Skeleton variant="button" className="flex-1" />
            <Skeleton variant="button" className="flex-1" />
          </div>
        </Card>
      ))}
    </>
  );
};

export default UserCardSkeleton;


