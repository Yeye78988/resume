const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { nanoid } = require('nanoid');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// 连接MongoDB
mongoose.connect('mongodb://localhost:27017/resume_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const resumeSchema = new mongoose.Schema({
  resume_id: { type: String, unique: true, default: 'main' },
  data: Object,
}, { collection: 'resumes' });

const Resume = mongoose.model('Resume', resumeSchema);

// --- 新增：分享功能的数据模型 ---
const shareSchema = new mongoose.Schema({
  share_id: { type: String, unique: true, required: true },
  data: Object,
  createdAt: { type: Date, default: Date.now, expires: '30d' }, // 30天后自动过期
});

const Share = mongoose.model('Share', shareSchema);

// 获取简历数据
app.get('/api/resume', async (req, res) => {
  try {
    const resume = await Resume.findOne({ resume_id: 'main' });
    res.json(resume ? resume.data : {});
  } catch (err) {
    res.status(500).send('读取失败');
  }
});

// 更新或创建简历数据 (Upsert)
app.post('/api/resume', async (req, res) => {
  try {
    await Resume.findOneAndUpdate(
      { resume_id: 'main' },
      { data: req.body },
      { upsert: true, new: true } // 如果文档不存在，则创建它
    );
    res.send('保存成功');
  } catch (err) {
    res.status(500).send('保存失败');
  }
});

// --- 新增：创建分享链接 ---
app.post('/api/share', async (req, res) => {
  try {
    const shareId = nanoid(8); // 生成一个8位的随机ID
    const newShare = new Share({
      share_id: shareId,
      data: req.body,
    });
    await newShare.save();
    res.json({ shareId });
  } catch (err) {
    res.status(500).send('创建分享链接失败');
  }
});

// --- 新增：根据ID获取分享的简历 ---
app.get('/api/share/:id', async (req, res) => {
  try {
    const share = await Share.findOne({ share_id: req.params.id });
    if (share) {
      res.json(share.data);
    } else {
      res.status(404).send('分享不存在或已过期');
    }
  } catch (err) {
    res.status(500).send('获取分享数据失败');
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
}); 