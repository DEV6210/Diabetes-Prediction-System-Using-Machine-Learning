
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PredictionForm from "@/components/PredictionForm";
import { DiabetesInfo } from "@/components/DiabetesInfo";
import { AlertCircle, Activity, HeartPulse, BookOpen, RefreshCcw, CircleFadingPlus, CircleArrowRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import axios from 'axios';
import API_BASE_URL from "@/config";
import './style.css'

const Index = () => {
  const [isProceed, setisProceed] = useState(false)
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiHealthy, setApiHealthy] = useState(null);
  const [apiHealthMessage, setApiHealthMessage] = useState('');

  const checkApiHealth = useCallback(async () => {
    setLoading(true); // Show loading while checking health
    try {
      console.log(`Checking API health at: ${API_BASE_URL}/health`);
      const response = await axios.get(`${API_BASE_URL}/health`);
      console.log("API Health Response:", response);
      if (response.data && response.data.status === "healthy") {
        setApiHealthy(true);
        setisProceed(true)
        setApiHealthMessage(response.data.message || "API is healthy.");
        setError(''); // Clear previous errors if API is now healthy
      } else {
        setApiHealthy(false);
        const message = response.data ? response.data.message : 'Unknown API issue.';
        setApiHealthMessage(`API status: ${message}`);
        setError(`API is unhealthy: ${message}`);
      }
    } catch (err) {
      console.error("API health check error:", err);
      setApiHealthy(false);
      let message = 'Failed to connect to the API. Is the backend server running?';
      if (err.message) {
        message += ` (Details: ${err.message})`;
      }
      setApiHealthMessage(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array, checkApiHealth doesn't change

  useEffect(() => {
    checkApiHealth();
  }, [checkApiHealth]); // Run checkApiHealth when component mounts and if checkApiHealth changes (it won't here)

  return (
    <>
      {
        !isProceed ?
          <div className="App">
            <header className="App-header">
              <h1 className="heading">💉 Diabetes Prediction System</h1>
              <div className={`api-status ${apiHealthy ? 'healthy' : 'unhealthy'}`}>
                API Status: {apiHealthy === null ? "Initializing and Checking..." : (apiHealthy ? "Healthy" : "Issues Detected")}
                {
                  apiHealthMessage && <>
                    <small style={{ display: 'block' }}> ({apiHealthMessage})</small>

                    {
                      apiHealthy ?
                        <button onClick={() => { setisProceed(true) }} className="btn btn-primary mt-4">
                          <span style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center' }}>
                            <CircleArrowRight size={20} /> Continue
                          </span>
                        </button>
                        :
                        <button onClick={() => { window.location.reload() }} className="btn btn-danger mt-4">
                          <span style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center' }}>
                            <RefreshCcw size={20} /> Reload
                          </span>
                        </button>
                    }
                  </>

                }
              </div>
            </header>
          </div>
          :
          <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
              <div className="container mx-auto px-4 py-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HeartPulse className="h-8 w-8 text-medical-600" />
                  <h1 className="text-2xl font-bold text-gray-900">Diabetes Prediction System</h1>
                </div>
                <nav>
                  <ul className="flex items-center space-x-6">
                    <li>
                      <a href="#About" className="text-gray-600 hover:text-medical-600 font-medium">
                        About
                      </a>
                    </li>
                    <li>
                      <a href="#RiskAssessment" className="text-gray-600 hover:text-medical-600 font-medium">
                        Risk Assessment
                      </a>
                    </li>
                    <li>
                      <a href="tel:9382370394" className="bg-medical-600 hover:bg-medical-700 text-white px-4 py-2 rounded-md font-medium">
                        Contact Doctor
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </header>

            <div className="container mx-auto px-4 py-8">
              <div className="max-w-4xl mx-auto text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Diabetes Risk Prediction Tool</h2>
                <p className="text-lg text-gray-600">
                  Assess your risk of diabetes using our advanced prediction model based on your health metrics
                </p>
                <div className="flex items-center justify-center mt-4 px-4 py-3 bg-blue-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                  <p className="text-sm text-blue-700">
                    This tool is for informational purposes only and should not replace professional medical advice
                  </p>
                </div>
              </div>

              <Tabs defaultValue="prediction" className="max-w-4xl mx-auto" id="RiskAssessment">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="prediction" className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    <span>Risk Assessment</span>
                  </TabsTrigger>
                  <TabsTrigger value="education" className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    <span>Education</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="prediction" className="animate-slide-in">
                  <PredictionForm />
                </TabsContent>

                <TabsContent value="education" className="animate-slide-in">
                  <DiabetesInfo />
                </TabsContent>

              </Tabs>
            </div>

            <footer className="bg-gray-800 text-white mt-16" id="About">
              <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between">
                  <div className="mb-6 md:mb-0">
                    <div className="flex items-center gap-2 mb-4">
                      <HeartPulse className="h-6 w-6 text-medical-300" />
                      <h2 className="text-xl font-bold">Diabetes Prediction System</h2>
                    </div>
                    <p className="text-gray-400 max-w-md">
                      Our mission is to provide accessible tools for diabetes risk assessment and prevention through education and early detection.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
                      <ul className="space-y-2">
                        <li><a href="#" className="text-gray-400 hover:text-white">About</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Resources</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Additional Resources</h3>
                      <ul className="space-y-2">
                        <li><a href="#" className="text-gray-400 hover:text-white">Diabetes Prevention</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Find a Doctor</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Research</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Support Groups</a></li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-700 mt-8 pt-6 text-sm text-gray-400">
                  <p>© 2025 Diabetes Prediction System. All rights reserved. This tool is for educational purposes only.</p>
                </div>
              </div>
            </footer>
          </div>
      }
    </>
  );
};

export default Index;