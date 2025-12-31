import Card from "../cards/Card";
import Skeleton from "./Skeleton";

const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <Card className="p-6 overflow-x-auto">
      {/* Table Header */}
      <div className="flex gap-4 mb-4 pb-4 border-b border-charcoal-grey/10">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} variant="text" className="flex-1 h-5" />
        ))}
      </div>
      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 mb-3">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" className="flex-1 h-4" />
          ))}
        </div>
      ))}
    </Card>
  );
};

export default TableSkeleton;






