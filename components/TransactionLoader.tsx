import React from "react";
import { motion } from "framer-motion";

interface TransactionLoaderProps {
  message: string;
}

const TransactionLoader: React.FC<TransactionLoaderProps> = ({ message }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="p-8 bg-white rounded-lg shadow-lg text-center">
        <div className="mb-4">
          <div className="loader"></div>
        </div>
        <p className="text-lg font-semibold text-gray-700">{message}</p>
      </div>
      <style jsx>{`
        .loader {
          border: 8px solid #f3f3f3;
          border-top: 8px solid #3498db;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          animation: spin 2s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
};

export default TransactionLoader;
