// components/ReusableAlert.tsx
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface ReusableAlertProps {
  type: "success" | "error"; // Alert type
  title: string; // Title for the alert
  description: string; // Description message
}

export const ReusableAlert: React.FC<ReusableAlertProps> = ({
  type,
  title,
  description,
}) => {
  const alertStyles = cn({
    "bg-green-100 border-green-400 text-green-800": type === "success", // Success colors
    "bg-red-100 border-red-400 text-red-800": type === "error", // Error colors
  });

  return (
    <Alert className={`mt-4 border-l-4 p-4 ${alertStyles}`}>
      <AlertTitle className="font-bold">{title}</AlertTitle>
      <AlertDescription className="max-w-sm break-words">
        {description}
      </AlertDescription>
    </Alert>
  );
};
