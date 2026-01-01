import Card from "../cards/Card";
import Skeleton from "./Skeleton";

const ProfileSkeleton = () => {
  return (
    <Card className="p-8">
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        {/* Avatar */}
        <Skeleton variant="avatar" className="w-24 h-24" />
        <div className="flex-1 space-y-3">
          <Skeleton variant="title" className="w-1/3" />
          <Skeleton variant="text" className="w-1/2" />
          <Skeleton variant="text" className="w-2/3" />
        </div>
      </div>
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <Skeleton variant="text" className="mb-2 w-1/4" />
            <Skeleton variant="text" className="w-full h-10 rounded-lg" />
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ProfileSkeleton;










