
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { predictDiabetes } from "@/utils/diabetesPrediction";
import { PredictionResult } from "@/components/PredictionResult";
import axios from "axios";
import API_BASE_URL from "@/config";


const DEFAULT_FEATURES = {
  Pregnancies: 3,
  Glucose: 120,
  BloodPressure: 70,
  SkinThickness: 20,
  Insulin: 80,
  BMI: 32.0,
  DiabetesPedigreeFunction: 0.470,
  Age: 33,
};

const FEATURE_DETAILS = {
  Pregnancies: { min: 0, max: 17, step: 1, label: "Pregnancies" },
  Glucose: { min: 0, max: 250, step: 1, label: "Glucose (mg/dL)" },
  BloodPressure: { min: 0, max: 140, step: 1, label: "Blood Pressure (mm Hg)" },
  SkinThickness: { min: 0, max: 99, step: 1, label: "Skin Thickness (mm)" },
  Insulin: { min: 0, max: 900, step: 1, label: "Insulin (mu U/ml)" },
  BMI: { min: 0.0, max: 70.0, step: 0.1, label: "BMI (kg/m²)" },
  DiabetesPedigreeFunction: { min: 0.000, max: 2.500, step: 0.001, label: "Diabetes Pedigree Function" },
  Age: { min: 18, max: 100, step: 1, label: "Age (years)" },
};

const PredictionForm = () => {
  // const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();


  const [formData, setFormData] = useState(DEFAULT_FEATURES);
  const [predictionResult, setPredictionResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiHealthy, setApiHealthy] = useState(null);
  const [apiHealthMessage, setApiHealthMessage] = useState('');


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const featureDetail = FEATURE_DETAILS[name];

    if (value === '') { // Allow temporarily empty for user input
      setFormData(prev => ({ ...prev, [name]: '' }));
      return;
    }

    let parsedValue = (featureDetail.step === 0.1 || featureDetail.step === 0.001)
      ? parseFloat(value)
      : parseInt(value, 10);

    // If parsing results in NaN (e.g., user types "abc"), keep the input field as is or set to a valid state
    // For simplicity, we'll let the validation on submit catch persistent NaNs.
    // Or, you could choose to revert to a previous valid value or clamp.
    if (isNaN(parsedValue) && value !== "-") { // Allow "-" for negative number input start
      // Potentially set an inline error for this field or just let the value be for now
      // For this example, we'll allow the invalid text to remain until submit validation
      setFormData(prev => ({ ...prev, [name]: value })); // Keep raw value if not parseable
    } else {
      setFormData(prev => ({ ...prev, [name]: parsedValue }));
    }
  };


  // const handleSliderChange = (e) => {
  //   const { name, value } = e.target;
  //   const featureDetail = FEATURE_DETAILS[name];

  //   if (value === '') { // Allow temporarily empty for user input
  //     setFormData(prev => ({ ...prev, [name]: '' }));
  //     return;
  //   }

  //   let parsedValue = (featureDetail.step === 0.1 || featureDetail.step === 0.001)
  //     ? parseFloat(value)
  //     : parseInt(value, 10);

  //   // If parsing results in NaN (e.g., user types "abc"), keep the input field as is or set to a valid state
  //   // For simplicity, we'll let the validation on submit catch persistent NaNs.
  //   // Or, you could choose to revert to a previous valid value or clamp.
  //   if (isNaN(parsedValue) && value !== "-") { // Allow "-" for negative number input start
  //     // Potentially set an inline error for this field or just let the value be for now
  //     // For this example, we'll allow the invalid text to remain until submit validation
  //     setFormData(prev => ({ ...prev, [name]: value })); // Keep raw value if not parseable
  //   } else {
  //     setFormData(prev => ({ ...prev, [name]: parsedValue }));
  //   }
  // };
  const handleSliderChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value[0] }));
  };


  const handleSubmit = async (e) => {
    setIsSubmitting(true);

    // Validate form data
    const missingFields = Object.entries(formData).filter(([_, value]) =>
      value === undefined || value === null || isNaN(Number(value))
    );

    if (missingFields.length > 0) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields to get an accurate prediction.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    e.preventDefault();
    setLoading(true);
    setError('');
    setPredictionResult(null);

    // Client-side validation
    const currentFormData = { ...formData };
    for (const key in FEATURE_DETAILS) {
      const value = currentFormData[key];
      if (value === '' || value === null || isNaN(Number(value))) {
        setError(`Please enter a valid number for ${FEATURE_DETAILS[key].label}. Value found: '${value}' for ${key}`);
        setLoading(false);
        return;
      }
      // Ensure correct type for payload if necessary (though numbers should be fine)
      currentFormData[key] = Number(value);
    }

    try {
      console.log("Submitting payload:", currentFormData);
      const response = await axios.post(`${API_BASE_URL}/predict`, currentFormData);
      console.log("Prediction API Response:", response);
      if (response.data) {
        setPredictionResult(response.data);
      } else {
        setError("Received an empty response from the prediction API.");
      }
    } catch (err) {
      console.error("Prediction error details:", err);
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response data:", err.response.data);
        console.error("Error response status:", err.response.status);
        setError(`Prediction API Error (${err.response.status}): ${err.response.data.description || err.response.data.error || 'Unknown server error'}`);
      } else if (err.request) {
        // The request was made but no response was received
        console.error("Error request data:", err.request);
        setError('No response from server. The backend might be down or unreachable.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', err.message);
        setError(`An error occurred: ${err.message}`);
      }
    } finally {

      // Simulate API/ML model delay
      setTimeout(() => {
        // Explicitly match the input data with the PatientData interface
        setLoading(false);
        setIsSubmitting(false);
      }, 1500);
    }
  };

  const resetForm = () => {
    setFormData(DEFAULT_FEATURES);
    setPredictionResult(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {!predictionResult ? (
        <Card className="w-full shadow-lg animate-fade-in">
          <CardHeader className="bg-medical-500 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold">Diabetes Risk Assessment</CardTitle>
            <CardDescription className="text-white/80">
              Enter your health information to assess your diabetes risk
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {Object.keys(FEATURE_DETAILS).map((key) => (
                <div className="space-y-2" key={key}>
                  <Label htmlFor={key}>{FEATURE_DETAILS[key].label}:</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id={key}
                      name={key}
                      min={FEATURE_DETAILS[key].min}
                      max={FEATURE_DETAILS[key].max}
                      step={FEATURE_DETAILS[key].step}
                      value={[formData[key]]}
                      onValueChange={(value) => handleSliderChange(key, value)}
                      className="flex-grow"
                    />


                    <Input
                      type="number" // "text" might be better with custom parsing if "number" input is finicky
                      id={key}
                      name={key}
                      value={formData[key]} // Directly bind to potentially non-numeric string state
                      onChange={handleInputChange}
                      min={FEATURE_DETAILS[key].min}
                      max={FEATURE_DETAILS[key].max}
                      step={FEATURE_DETAILS[key].step}
                      required
                      className="w-20"
                      placeholder={`e.g., ${FEATURE_DETAILS[key].min + Math.round((FEATURE_DETAILS[key].max - FEATURE_DETAILS[key].min) / 2 * 10) / 10}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-4 pt-2">
            <Button variant="outline" onClick={resetForm}>Reset</Button>
            <Button
              onClick={handleSubmit}
              className="bg-medical-600 hover:bg-medical-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Analyzing..." : "Get Prediction"}
            </Button>
          </CardFooter>

          {/* Display general error message if not loading and error is present */}
          {!loading && error && <p className="error-message">{error}</p>}

        </Card>
      ) : (
        <PredictionResult
          predictionResult={predictionResult}
          onReset={resetForm}
          patientData={formData}
        />
      )}
    </div>
  );
};

export default PredictionForm;
