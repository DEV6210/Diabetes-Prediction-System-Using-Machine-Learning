
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Info, ArrowLeft } from "lucide-react";
import { RiskFactorChart } from "@/components/RiskFactorChart";
import { predictDiabetes } from "@/utils/diabetesPrediction";

interface ResultProps {
  result: {
    prediction: 'Diabetic' | 'Non-Diabetic';
    confidenceScore: number;
    riskLevel: 'Low' | 'Moderate' | 'High';
    riskFactors: string[];
  };
  data: {
    glucose: number;
    bloodPressure: number;
    insulin: number;
    bmi: number;
    age: number;
    [key: string]: number;
  };
  onReset: () => void;
}

export const PredictionResult = ({ predictionResult, patientData, onReset }: ResultProps) => {

  // {
  //   "model_info": "LogisticRegression",
  //     "prediction": 0,
  //       "probability_diabetes": 0.2596306265816486,
  //         "probability_no_diabetes": 0.7403693734183514
  // }

  const data = {
    pregnancies: patientData.Pregnancies,
    glucose: patientData.Glucose,
    bloodPressure: patientData.BloodPressure,
    skinThickness: patientData.SkinThickness,
    insulin: patientData.Insulin,
    bmi: patientData.BMI,
    diabetesPedigree: patientData.DiabetesPedigreeFunction,
    age: patientData.Age
  };

  const result = predictDiabetes(data);
  const { prediction, confidenceScore, riskLevel, riskFactors } = result

  const getRiskColor = () => {
    switch (riskLevel) {
      case 'Low': return 'bg-green-500';
      case 'Moderate': return 'bg-yellow-500';
      case 'High': return 'bg-red-500';
      default: return 'bg-medical-500';
    }
  };

  const getRiskBadge = () => {
    switch (riskLevel) {
      case 'Low':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Low Risk</Badge>;
      case 'Moderate':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Moderate Risk</Badge>;
      case 'High':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">High Risk</Badge>;
      default:
        return null;
    }
  };


  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Diabetes Prediction Results</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            .section { margin-bottom: 20px; }
            .section-title { font-weight: bold; margin-bottom: 10px; }
            .risk-badge { padding: 5px 10px; border-radius: 5px; color: #fff; }
            .low { background-color: #4caf50; }
            .moderate { background-color: #ff9800; }
            .high { background-color: #f44336; }
          </style>
        </head>
        <body>
          <h1>Diabetes Prediction Results</h1>
  
          <div class="section">
            <div class="section-title">Prediction:</div>
            <div>${prediction}</div>
          </div>
  
          <div class="section">
            <div class="section-title">Confidence Score:</div>
            <div>${confidenceScore}%</div>
          </div>
  
          <div class="section">
            <div class="section-title">Risk Level:</div>
            <div class="risk-badge ${riskLevel.toLowerCase()}">${riskLevel}</div>
          </div>
  
          <div class="section">
            <div class="section-title">Risk Factors:</div>
            <ul>
              ${riskFactors.length > 0
        ? riskFactors.map(factor => `<li>${factor}</li>`).join('')
        : '<li>No significant risk factors identified</li>'
      }
            </ul>
          </div>
  
          <div class="section">
            <div class="section-title">Disclaimer:</div>
            <p>This tool provides an estimated risk assessment based on the provided information and should not replace professional medical advice, diagnosis, or treatment.</p>
          </div>
  
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    }
  };

  return (
    <div className="animate-fade-in">
      <Card className="w-full shadow-lg">
        <CardHeader className={`${getRiskColor()} text-white rounded-t-lg`}>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            {prediction === 'Diabetic' ? (
              <AlertCircle className="h-6 w-6" />
            ) : (
              <CheckCircle className="h-6 w-6" />
            )}
            {prediction === 'Diabetic' ? 'Increased Diabetes Risk Detected' : 'Low Diabetes Risk Detected'}
          </CardTitle>
          <CardDescription className="text-white/90">
            Based on the provided health information
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Confidence Score: {confidenceScore}%</span>
              <span className="flex items-center gap-1">
                {getRiskBadge()}
              </span>
            </div>
            <Progress value={confidenceScore} className="h-2" />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Info className="h-5 w-5 text-medical-600" />
                Key Risk Factors
              </h3>
              <ul className="space-y-2 pl-2">
                {riskFactors.map((factor, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="bg-medical-100 text-medical-800 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span>{factor}</span>
                  </li>
                ))}
                {riskFactors.length === 0 && (
                  <li className="text-sm text-gray-600">No significant risk factors identified</li>
                )}
              </ul>


              {predictionResult && (
                <div className="mt-3">
                  <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
                    <Info className="h-5 w-5 text-medical-600" />
                    Prediction Result</h2>

                  <ul className="space-y-2 pl-2">
                    <li className="flex items-start gap-2 text-sm">
                      <span className="bg-medical-100 text-medical-800 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      </span>
                      <p className={predictionResult.prediction === 1 ? 'diabetes-positive' : 'diabetes-negative'}>
                        Status: <strong>{predictionResult.prediction === 1 ? 'Likely Diabetic' : 'Likely Not Diabetic'}</strong>
                      </p>
                    </li>

                    <li className="flex items-start gap-2 text-sm">
                      <span className="bg-medical-100 text-medical-800 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      </span>
                      <p>Probability of Diabetes: <strong>{(predictionResult.probability_diabetes * 100).toFixed(2)}%</strong></p>
                    </li>

                    <li className="flex items-start gap-2 text-sm mb-3">
                      <span className="bg-medical-100 text-medical-800 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      </span>
                      <p>Probability of No Diabetes: <strong>{(predictionResult.probability_no_diabetes * 100).toFixed(2)}%</strong></p>
                    </li>

                    {predictionResult.model_info && <p style={{ background: '#F0F0F0', borderLeft: 'solid 2px #0D6EFD', paddingLeft: 5, paddingBottom: 2 }} ><small>Model used: {predictionResult.model_info}</small></p>}
                  </ul>


                </div>
              )}
            </div>


            <RiskFactorChart patientData={data} />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">What does this mean?</h3>
            <p className="text-blue-700 text-sm">
              {prediction === 'Diabetic'
                ? "Your results indicate an elevated risk for diabetes. This is not a diagnosis, but suggests you might benefit from consulting with a healthcare provider."
                : "Your results suggest a lower risk for diabetes. Continue maintaining healthy habits and regular check-ups with your healthcare provider."
              }
            </p>
          </div>

          <div className="text-xs text-gray-500 mt-4">
            <strong>Disclaimer:</strong> This tool provides an estimated risk assessment based on the provided information and should not replace professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider.
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-2">
          <Button variant="outline" onClick={onReset} className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Form
          </Button>
          <Button onClick={() => handlePrint()} className="bg-medical-600 hover:bg-medical-700 text-white">
            Print Results
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
