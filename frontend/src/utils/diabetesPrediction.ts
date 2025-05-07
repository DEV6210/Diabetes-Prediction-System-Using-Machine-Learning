
// Utility to simulate diabetes prediction model

interface PatientData {
  glucose: number;
  bloodPressure: number;
  insulin: number;
  bmi: number;
  age: number;
  pregnancies?: number;
  skinThickness?: number;
  diabetesPedigree?: number;
}

interface PredictionResult {
  prediction: 'Diabetic' | 'Non-Diabetic';
  confidenceScore: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
  riskFactors: string[];
}

// This is a simplified model for demonstration purposes
// In a real application, this would use a trained ML model
export function predictDiabetes(data: PatientData): PredictionResult {
  // Calculate a simple risk score (this is just for simulation)
  let riskScore = 0;
  
  // Add risk points based on glucose levels
  if (data.glucose > 140) riskScore += 30;
  else if (data.glucose > 100) riskScore += 15;
  
  // Add risk points based on BMI
  if (data.bmi > 30) riskScore += 20;
  else if (data.bmi > 25) riskScore += 10;
  
  // Add risk points based on age
  if (data.age > 50) riskScore += 15;
  else if (data.age > 40) riskScore += 10;
  else if (data.age > 30) riskScore += 5;
  
  // Add risk points based on blood pressure
  if (data.bloodPressure > 140) riskScore += 15;
  else if (data.bloodPressure > 120) riskScore += 10;
  
  // Add risk points based on insulin
  if (data.insulin > 180) riskScore += 15;
  else if (data.insulin > 150) riskScore += 10;
  
  // Add risk points based on diabetes pedigree if available
  if (data.diabetesPedigree) {
    if (data.diabetesPedigree > 1) riskScore += 15;
    else if (data.diabetesPedigree > 0.5) riskScore += 10;
  }
  
  // Calculate confidence score (0-100)
  const confidenceScore = Math.min(riskScore, 100);
  
  // Determine prediction and risk level
  const prediction = confidenceScore >= 50 ? 'Diabetic' : 'Non-Diabetic';
  let riskLevel: 'Low' | 'Moderate' | 'High' = 'Low';
  
  if (confidenceScore >= 70) riskLevel = 'High';
  else if (confidenceScore >= 40) riskLevel = 'Moderate';
  
  // Determine contributing risk factors
  const riskFactors: string[] = [];
  if (data.glucose > 100) riskFactors.push('Elevated glucose levels');
  if (data.bmi > 25) riskFactors.push('Elevated BMI');
  if (data.bloodPressure > 120) riskFactors.push('Elevated blood pressure');
  if (data.age > 40) riskFactors.push('Age factor');
  if (data.insulin > 150) riskFactors.push('Insulin resistance');
  if (data.diabetesPedigree && data.diabetesPedigree > 0.5) riskFactors.push('Family history of diabetes');
  
  return {
    prediction,
    confidenceScore,
    riskLevel,
    riskFactors
  };
}
