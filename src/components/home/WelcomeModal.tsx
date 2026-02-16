
import type { FC } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react"; 

interface WelcomeModalProps {
  onClose: () => void;
}

const WelcomeModal: FC<WelcomeModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 animate-fadeIn">
      <div className="bg-white p-8 md:p-10 rounded-2xl max-w-xl w-full shadow-xl relative transform scale-95 animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-5 text-3xl font-bold text-gray-400 hover:text-gray-700 transition"
        >
          &times;
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
          Welcome to the Intern Dashboard!
        </h2>

        {/* Message */}
        <div className="text-gray-600 space-y-3 text-sm md:text-base">
          <p>Your account has been successfully created.</p>
          <p>
            This system will help you manage tasks, track progress, submit work, view documents, handle leave requests, and access contract information.
          </p>
          <p>Please check the dashboard regularly for updates and announcements.</p>
          <p>We wish you a productive and successful internship experience!</p>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex justify-center">
          <Button variant="default" onClick={onClose}>
            Got it!
          </Button>
        </div>
      </div>

      {/* Animations (Tailwind) */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleUp {
            from { transform: scale(0.95); }
            to { transform: scale(1); }
          }
          .animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; }
          .animate-scaleUp { animation: scaleUp 0.25s ease-out forwards; }
        `}
      </style>
    </div>
  );
};

export default WelcomeModal;
