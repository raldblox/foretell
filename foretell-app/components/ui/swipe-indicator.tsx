import { motion } from "framer-motion";

const SwipeIndicator = ({
  touchStart,
  touchEnd,
}: {
  touchStart: any;
  touchEnd: any;
}) => {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
    >
      <div className="bg-foreground backdrop-blur-sm rounded-full px-4 p-2 text-background text-sm font-medium">
        {touchStart.x - touchEnd.x > 0 ? (
          <div className="flex items-center pr-4">
            <svg
              height="24"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="m8.165 11.63l6.63-6.43C15.21 4.799 16 5.042 16 5.57v12.86c0 .528-.79.771-1.205.37l-6.63-6.43a.5.5 0 0 1 0-.74"
                fill="currentColor"
              />
            </svg>
            <span>NEXT</span>
          </div>
        ) : (
          <div className="flex items-center pl-4">
            <span>PREV</span>
            <svg
              height="24"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.835 11.63L9.205 5.2C8.79 4.799 8 5.042 8 5.57v12.86c0 .528.79.771 1.205.37l6.63-6.43a.5.5 0 0 0 0-.74"
                fill="currentColor"
              />
            </svg>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SwipeIndicator;
