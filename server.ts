import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

const app = express();
const PORT = 3000;
const db = new Database("staffing.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS schools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    section TEXT
  );

  CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS staffing (
    school_id INTEGER,
    subject_id INTEGER,
    current_count INTEGER DEFAULT 0,
    required_count INTEGER DEFAULT 0,
    PRIMARY KEY (school_id, subject_id),
    FOREIGN KEY (school_id) REFERENCES schools(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
  );
`);

// Seed Data
const schoolsList = [
  "ابن خلدون للتعليم الأساسي المشتركة ع مشترك العريش قسم أول العريش",
  "ابوبكر الصديق للتعليم الاساسى / ع بنين العريش قسم ثان العريش",
  "ابي صقل الجديدة للتعليم الأساسي ع مشترك العريش قسم أول العريش",
  "اسماء بنت ابى بكر الاعدادية بنات العريش قسم أول العريش",
  "السادات الاعداديـة بنين العريش قسم ثالث العريش",
  "السبيل للتعليم الاساسى / ع مشترك العريش قسم رابع العريش",
  "السكاسكة الاعدادية المشتركة مشترك العريش قسم أول العريش",
  "السيده/ خديجة بنت خويلد ع بنات العريش قسم أول العريش",
  "السيده/عائشة ام المؤمنين للتعليم الاساسى / ع بنات العريش قسم ثالث العريش",
  "الشريفات للتعليم الاساسى / ع مشترك العريش قسم أول العريش",
  "الشهيد /حمدي العبد للتعليم الأساسي/ ع مشترك العريش قسم ثالث العريش",
  "الشهيد الخفير عيد سلامه العبد حسين تعليم اساسي / ع بنين العريش قسم ثالث العريش",
  "الشهيد الرائد/ رفيق عزت محمد خليل/ ع بنين العريش قسم ثان العريش",
  "الشهيد النقيب/ عاصم احمد حسن عبدالوهاب / ع بنين العريش قسم أول العريش",
  "الشهيد شريف محمد حسين للتعليم الاساسي / ع بنات العريش قسم ثان العريش",
  "الشهيد طارق اسماعيل صدقى / ع مشترك العريش قسم رابع العريش",
  "الشهيد عبد الخالق حسين الشهير براشد الرقاية متعددة المراحل / ع مشترك العريش قسم ثالث العريش",
  "الشهيد عمر الأحامدة تعليم اساسي اعدادي مشترك العريش قسم ثالث العريش",
  "الشهيد ملازم اول مصطفى يحى جاويش للتعليم الاساسى ع بنات بنات العريش قسم ثالث العريش",
  "الشهيد/محمد الكاشف للتعليم الاساسي / ع بنين بنين العريش قسم ثالث العريش",
  "الشهيده الدكتوره بسمه سعيد راشد للتعليم الأساسي ع بنات بنات العريش قسم ثان العريش",
  "الشهيده ندى احمد خميس ابو اقرع تعليم اساسى / ع مشترك العريش قسم ثالث العريش",
  "الشيخ محمود عبيد الاعدادية المهنية المشتركه بنين العريش قسم ثان العريش",
  "الصفوة متعددة المراحل / ع مشترك العريش قسم ثالث العريش",
  "الطويل للتعليم الأساسي المشتركة / ع مشترك العريش قسم أول العريش",
  "العاشر من رمضان / ع بنات العريش قسم ثالث العريش",
  "العبور للتعليم الاساسى / ع مشترك العريش قسم أول العريش",
  "الكرامة للتعليم الاساسى المشتركة / ع مشترك العريش قسم أول العريش",
  "المراشدة للتعليم الاساسى / ع مشترك العريش قسم أول العريش",
  "الميدان للتعليم الاساسى / ع مشترك العريش قسم رابع العريش",
  "بئر لحفن للتعليم الاساسى / ع مشترك العريش قسم أول العريش",
  "حمدان الخليلى للتعليم الاساسى / ع بنات العريش قسم أول العريش",
  "خيرى طولسون ع بنين العريش قسم أول العريش",
  "زارع الخير للتعليم الاساسى المشتركة / ع مشترك العريش قسم رابع العريش",
  "صلاح الدين تعليم اساسى / ع بنين مشترك العريش قسم ثالث العريش",
  "على بن ابى طالب الاعدادية بنين العريش قسم رابع العريش",
  "عمرو بن العاص للتعليم الاساسي ع بنين العريش قسم ثالث العريش",
  "فاطمة الزهراء ع بنات العريش قسم ثان العريش",
  "يوسف الصديق تعليم أساسي اعدادي"
];

const subjectsList = [
  "اللغة العربية",
  "اللغة الإنجليزية",
  "اللغة الفرنسية",
  "الدراسات الاجتماعية",
  "التربية الرياضية",
  "العلوم",
  "الرياضيات"
];

const checkSchools = db.prepare("SELECT COUNT(*) as count FROM schools").get() as { count: number };
if (checkSchools.count === 0) {
  const insertSchool = db.prepare("INSERT INTO schools (name) VALUES (?)");
  const insertSubject = db.prepare("INSERT INTO subjects (name) VALUES (?)");
  const insertStaffing = db.prepare("INSERT INTO staffing (school_id, subject_id) VALUES (?, ?)");

  db.transaction(() => {
    schoolsList.forEach(name => insertSchool.run(name));
    subjectsList.forEach(name => insertSubject.run(name));

    const schools = db.prepare("SELECT id FROM schools").all() as { id: number }[];
    const subjects = db.prepare("SELECT id FROM subjects").all() as { id: number }[];

    schools.forEach(school => {
      subjects.forEach(subject => {
        insertStaffing.run(school.id, subject.id);
      });
    });
  })();
}

app.use(express.json());

// API Routes
app.get("/api/data", (req, res) => {
  const schools = db.prepare("SELECT * FROM schools").all();
  const subjects = db.prepare("SELECT * FROM subjects").all();
  const staffing = db.prepare(`
    SELECT s.*, sub.name as subject_name 
    FROM staffing s
    JOIN subjects sub ON s.subject_id = sub.id
  `).all();
  
  res.json({ schools, subjects, staffing });
});

app.post("/api/update", (req, res) => {
  const { school_id, subject_id, current_count, required_count } = req.body;
  const update = db.prepare(`
    UPDATE staffing 
    SET current_count = ?, required_count = ?
    WHERE school_id = ? AND subject_id = ?
  `);
  update.run(current_count, required_count, school_id, subject_id);
  res.json({ success: true });
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
