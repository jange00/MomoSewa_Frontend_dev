import Card from "../cards/Card";
import Skeleton from "./Skeleton";

const ProductCardSkeleton = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="p-6">
          <Skeleton variant="image" className="mb-4" />
          <Skeleton variant="heading" className="mb-2 w-3/4" />
          <Skeleton variant="text" className="mb-1 w-full" />
          <Skeleton variant="text" className="mb-4 w-2/3" />
          <div className="flex items-center justify-between">
            <Skeleton variant="text" className="w-20 h-6" />
            <Skeleton variant="button" />
          </div>
        </Card>
      ))}
    </>
  );
};

export default ProductCardSkeleton;





