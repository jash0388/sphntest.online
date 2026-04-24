const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

const questions = [
  {
    question: "What is TypeScript?",
    question_type: "mcq",
    options: ["A database", "A superset of JavaScript", "A framework", "A compiler only"],
    correct_answer: "A superset of JavaScript",
    marks: 5
  },
  {
    question: "Which file extension is used for TypeScript?",
    question_type: "mcq",
    options: [".js", ".ts", ".tsx", "Both B and C"],
    correct_answer: "Both B and C",
    marks: 5
  },
  {
    question: "How do you define a variable with a specific type in TypeScript?",
    question_type: "mcq",
    options: ["let x = number;", "let x: number;", "var x -> number;", "int x;"],
    correct_answer: "let x: number;",
    marks: 5
  },
  {
    question: "Which command compiles TypeScript to JavaScript?",
    question_type: "mcq",
    options: ["ts-node", "node", "tsc", "compile-ts"],
    correct_answer: "tsc",
    marks: 5
  },
  {
    question: "What is the default type assigned if no type is specified?",
    question_type: "mcq",
    options: ["unknown", "any", "void", "string"],
    correct_answer: "any",
    marks: 5
  },
  {
    question: "Which keyword is used to define an interface?",
    question_type: "mcq",
    options: ["type", "interface", "class", "struct"],
    correct_answer: "interface",
    marks: 5
  },
  {
    question: "What does any type mean?",
    question_type: "mcq",
    options: ["Only string", "Only number", "Any type allowed", "No type allowed"],
    correct_answer: "Any type allowed",
    marks: 5
  },
  {
    question: "Which of the following is NOT a valid TypeScript type?",
    question_type: "mcq",
    options: ["string", "number", "boolean", "float"],
    correct_answer: "float",
    marks: 5
  },
  {
    question: "How do you define an array of numbers?",
    question_type: "mcq",
    options: ["let arr: number[];", "let arr: array;", "let arr = number[];", "let arr: num[];"],
    correct_answer: "let arr: number[];",
    marks: 5
  },
  {
    question: "What is the purpose of tsconfig.json?",
    question_type: "mcq",
    options: ["Store database config", "Configure TypeScript compiler", "Store API keys", "Run JavaScript"],
    correct_answer: "Configure TypeScript compiler",
    marks: 5
  },
  {
    question: "Which keyword is used for constant values?",
    question_type: "mcq",
    options: ["let", "var", "const", "static"],
    correct_answer: "const",
    marks: 5
  },
  {
    question: "What does void represent?",
    question_type: "mcq",
    options: ["Null value", "Undefined variable", "No return value", "Boolean false"],
    correct_answer: "No return value",
    marks: 5
  },
  {
    question: "How do you define a function return type?",
    question_type: "mcq",
    options: ["function f(): number {}", "function f -> number {}", "function f returns number {}", "function f:number {}"],
    correct_answer: "function f(): number {}",
    marks: 5
  },
  {
    question: "Which feature allows combining multiple types?",
    question_type: "mcq",
    options: ["Interface", "Union", "Enum", "Class"],
    correct_answer: "Union",
    marks: 5
  },
  {
    question: "Example of union type?",
    question_type: "mcq",
    options: ["let x: number | string;", "let x: number & string;", "let x: union;", "let x: any;"],
    correct_answer: "let x: number | string;",
    marks: 5
  },
  {
    question: "What is an enum in TypeScript?",
    question_type: "mcq",
    options: ["Function", "Collection of constants", "Array", "Loop"],
    correct_answer: "Collection of constants",
    marks: 5
  },
  {
    question: "Which keyword is used for inheritance?",
    question_type: "mcq",
    options: ["inherit", "extends", "implements", "super"],
    correct_answer: "extends",
    marks: 5
  },
  {
    question: "What does readonly do?",
    question_type: "mcq",
    options: ["Makes variable constant after initialization", "Deletes variable", "Makes variable optional", "Makes variable private"],
    correct_answer: "Makes variable constant after initialization",
    marks: 5
  },
  {
    question: "Which keyword is used to define optional properties?",
    question_type: "mcq",
    options: ["!", "?", "*", "#"],
    correct_answer: "?",
    marks: 5
  },
  {
    question: "What is TypeScript mainly used for?",
    question_type: "mcq",
    options: ["Styling web pages", "Backend only", "Adding types to JavaScript", "Database management"],
    correct_answer: "Adding types to JavaScript",
    marks: 5
  }
];

async function setupExam() {
  console.log("Setting up TS EMCET EXAM...");
  
  // 1. Create the exam
  const { data: exam, error: examError } = await supabase
    .from("exams")
    .insert({
      title: "TS EMCET EXAM",
      description: "TypeScript Engineering Agricultural and Medical Common Entrance Test (Mock)",
      duration_minutes: 30,
      max_violations: 5,
      is_active: true
    })
    .select()
    .single();
    
  if (examError) {
    console.error("Error creating exam:", examError);
    return;
  }
  
  console.log("Exam created with ID:", exam.id);
  
  // 2. Add questions
  const questionsToInsert = questions.map((q, index) => ({
    ...q,
    exam_id: exam.id,
    sort_order: index
  }));
  
  const { error: questionsError } = await supabase
    .from("exam_questions")
    .insert(questionsToInsert);
    
  if (questionsError) {
    console.error("Error inserting questions:", questionsError);
  } else {
    console.log("All 20 questions inserted successfully!");
  }
}

setupExam();
