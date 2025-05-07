
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const DiabetesInfo = () => {
  return (
    <Card className="shadow-md">
      <CardHeader className="bg-medical-100 rounded-t-lg">
        <CardTitle className="text-xl text-medical-900">Understanding Diabetes Risk</CardTitle>
        <CardDescription>Learn about diabetes risk factors and prevention</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="what-is-diabetes">
            <AccordionTrigger>What is diabetes?</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-gray-700">
                Diabetes is a chronic health condition that affects how your body converts food into energy. 
                Most food you eat is broken down into sugar (glucose) and released into your bloodstream. 
                When your blood sugar goes up, it signals your pancreas to release insulin. Insulin acts as 
                a key to let the blood sugar into your body's cells for use as energy.
              </p>
              <p className="text-sm text-gray-700 mt-2">
                With diabetes, your body either doesn't make enough insulin or can't use the insulin it makes 
                as well as it should. When there isn't enough insulin or cells stop responding to insulin, 
                too much blood sugar stays in your bloodstream. Over time, that can cause serious health problems.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="risk-factors">
            <AccordionTrigger>Common risk factors</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                <li>Being overweight or having obesity</li>
                <li>Being 45 years or older</li>
                <li>Having a parent, brother, or sister with diabetes</li>
                <li>Being physically active less than 3 times a week</li>
                <li>Having gestational diabetes during pregnancy</li>
                <li>Having high blood pressure</li>
                <li>Having abnormal cholesterol and triglyceride levels</li>
                <li>Having polycystic ovary syndrome</li>
                <li>Having a history of heart disease or stroke</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="prevention">
            <AccordionTrigger>Prevention strategies</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-gray-700">
                You can prevent or delay type 2 diabetes with simple, proven lifestyle changes:
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-2 text-sm text-gray-700">
                <li>Lose weight if you're overweight or maintain a healthy weight</li>
                <li>Get regular physical activity (at least 150 minutes a week)</li>
                <li>Follow a balanced diet rich in fruits, vegetables, lean proteins, and whole grains</li>
                <li>Limit processed foods and added sugars</li>
                <li>Control your blood pressure and cholesterol</li>
                <li>Quit smoking if you currently smoke</li>
                <li>Get regular check-ups with your healthcare provider</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="symptoms">
            <AccordionTrigger>Common symptoms</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-gray-700">
                Early detection of diabetes is important. Look out for these common symptoms:
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-2 text-sm text-gray-700">
                <li>Increased thirst and urination</li>
                <li>Increased hunger</li>
                <li>Fatigue</li>
                <li>Blurred vision</li>
                <li>Numbness or tingling in the feet or hands</li>
                <li>Unexplained weight loss</li>
                <li>Slow-healing sores</li>
                <li>Frequent infections</li>
              </ul>
              <p className="text-sm text-gray-700 mt-2 italic">
                If you experience these symptoms, please consult with a healthcare professional.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};
