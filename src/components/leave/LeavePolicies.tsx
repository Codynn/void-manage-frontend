import { CheckCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";

const LeavePolicies = () => {
  return (
    <Card className="">
      <CardHeader>
        <CardTitle className="">Leave Policy</CardTitle>
        <CardDescription className="text-gray-700">
          Important guidelines for leave applications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <span className="">Apply for leave at least 2 days in advance</span>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <span className="">Provide detailed reason for leave request</span>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <span className="">
              Emergency leaves can be applied on the same day
            </span>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <span className="">
              Maximum 5 days of leave allowed during internship
            </span>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <span className="">
              Mentor approval required for all leave requests
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeavePolicies;
