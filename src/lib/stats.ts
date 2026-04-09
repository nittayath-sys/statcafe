/**
 * StatCafe Statistics Engine 2026
 * รวมฟังก์ชันคำนวณสถิติพื้นฐานสำหรับการบริหารธุรกิจ
 */

// 1. คำนวณค่าเฉลี่ย (Mean)
export const calculateMean = (data: number[]): number => {
  if (data.length === 0) return 0;
  const sum = data.reduce((a, b) => a + b, 0);
  return sum / data.length;
};

// 2. คำนวณส่วนเบี่ยงเบนมาตรฐาน (Standard Deviation - SD)
// ใช้บอก "ความผันผวน" ยิ่งค่าสูง ยอดขายยิ่งไม่นิ่ง
export const calculateSD = (data: number[]): number => {
  if (data.length === 0) return 0;
  const mean = calculateMean(data);
  const squareDiffs = data.map((value) => Math.pow(value - mean, 2));
  const avgSquareDiff = calculateMean(squareDiffs);
  return Math.sqrt(avgSquareDiff);
};

// 3. คำนวณฐานนิยม (Mode)
// ใช้หาว่า "กลุ่มลูกค้ากลุ่มไหน" หรือ "ราคาส่วนใหญ่" ที่เกิดขึ้นบ่อยที่สุด
export const calculateMode = (data: any[]): any => {
  if (data.length === 0) return null;
  const mapping: { [key: string]: number } = {};
  data.forEach((item) => {
    mapping[item] = (mapping[item] || 0) + 1;
  });
  
  let maxCount = 0;
  let mode = data[0];
  for (const key in mapping) {
    if (mapping[key] > maxCount) {
      maxCount = mapping[key];
      mode = key;
    }
  }
  return mode;
};

// 4. ระบบสุ่มแบบ Normal Distribution (Box-Muller transform)
// ใช้จำลองจำนวนลูกค้าในแต่ละวันให้มีความสมจริง
export const randomNormal = (mean: number, sd: number): number => {
  const u = 1 - Math.random();
  const v = 1 - Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return Math.max(0, Math.round(z * sd + mean));
};
