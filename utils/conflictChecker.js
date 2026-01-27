// ./utils/conflictChecker.js - UPDATED VERSION
const Jadwal = require("../models/Jadwal");
const Booking = require("../models/Booking");
const MataKuliah = require("../models/MatKul");

// Fungsi untuk cek duplikat data (data yang sama persis)
function isDuplicateData(newData, existingData) {
  return (
    newData.hari === existingData.hari &&
    newData.jam_mulai === existingData.jam_mulai &&
    newData.jam_selesai === existingData.jam_selesai &&
    newData.mata_kuliah_id.toString() === existingData.mata_kuliah_id.toString() &&
    newData.ruang_id.toString() === existingData.ruang_id.toString()
  );
}

// Fungsi untuk cek apakah dosen sudah ada jadwal di waktu yang sama
async function cekDosenSibuk(mata_kuliah_id, hari, jam_mulai, jam_selesai, excludeId = null) {
  // Dapatkan mata kuliah beserta dosen_id
  const mataKuliah = await MataKuliah.findById(mata_kuliah_id).populate("dosen_id");
  if (!mataKuliah) return null;

  const dosenId = mataKuliah.dosen_id._id;

  // Cari semua jadwal di hari yang sama
  const jadwalDiHari = await Jadwal.find({
    hari: hari,
    $or: [
      { jam_mulai: { $lt: jam_selesai, $gte: jam_mulai } },
      { jam_selesai: { $gt: jam_mulai, $lte: jam_selesai } },
      {
        $and: [{ jam_mulai: { $lte: jam_mulai } }, { jam_selesai: { $gte: jam_selesai } }],
      },
    ],
  })
    .populate({
      path: "mata_kuliah_id",
      populate: { path: "dosen_id" },
    })
    .populate("ruang_id");

  // Cek apakah ada jadwal dengan dosen yang sama
  const konflikDosen = jadwalDiHari.find((jadwal) => {
    if (excludeId && jadwal._id.toString() === excludeId.toString()) {
      return false;
    }
    const dosenJadwal = jadwal.mata_kuliah_id?.dosen_id?._id;
    return dosenJadwal && dosenJadwal.toString() === dosenId.toString();
  });

  return konflikDosen || null;
}

// Fungsi utama untuk cek konflik jadwal
exports.cekKonflikJadwal = async (ruang_id, hari, jam_mulai, jam_selesai, mata_kuliah_id = null, excludeId = null) => {
  const query = {
    ruang_id,
    hari,
    $or: [
      { jam_mulai: { $lt: jam_selesai, $gte: jam_mulai } },
      { jam_selesai: { $gt: jam_mulai, $lte: jam_selesai } },
      {
        $and: [{ jam_mulai: { $lte: jam_mulai } }, { jam_selesai: { $gte: jam_selesai } }],
      },
    ],
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const konflikRuang = await Jadwal.findOne(query).populate("mata_kuliah_id").populate("ruang_id");

  // Cek konflik dosen jika ada mata_kuliah_id
  let konflikDosen = null;
  if (mata_kuliah_id) {
    konflikDosen = await cekDosenSibuk(mata_kuliah_id, hari, jam_mulai, jam_selesai, excludeId);
  }

  return {
    konflikRuang,
    konflikDosen,
    adaKonflik: !!(konflikRuang || konflikDosen),
  };
};

// Fungsi untuk cek konflik booking (tidak berubah)
exports.cekKonflikBooking = async (ruang_id, tanggal, jam_mulai, jam_selesai, excludeId = null) => {
  const query = {
    ruang_id,
    tanggal: { $eq: new Date(tanggal) },
    $or: [
      { jam_mulai: { $lt: jam_selesai, $gte: jam_mulai } },
      { jam_selesai: { $gt: jam_mulai, $lte: jam_selesai } },
      {
        $and: [{ jam_mulai: { $lte: jam_mulai } }, { jam_selesai: { $gte: jam_selesai } }],
      },
    ],
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return await Booking.findOne(query);
};

// Fungsi untuk cek konflik total
exports.cekKonflikTotal = async (ruang_id, hari, tanggal, jam_mulai, jam_selesai, mata_kuliah_id = null) => {
  const { konflikRuang, konflikDosen, adaKonflik: konflikJadwal } = await exports.cekKonflikJadwal(ruang_id, hari, jam_mulai, jam_selesai, mata_kuliah_id);

  const konflikBooking = await exports.cekKonflikBooking(ruang_id, tanggal, jam_mulai, jam_selesai);

  return {
    konflikRuang,
    konflikDosen,
    konflikBooking,
    adaKonflik: !!(konflikRuang || konflikDosen || konflikBooking),
  };
};

// Fungsi untuk membersihkan data duplikat dari database yang ada
exports.hapusDataDuplikat = async () => {
  console.log("🔍 Mencari dan menghapus data duplikat...");

  // Ambil semua jadwal
  const semuaJadwal = await Jadwal.find().populate("mata_kuliah_id").populate("ruang_id").sort({ hari: 1, jam_mulai: 1 });

  const seen = new Set();
  const duplikatIds = [];

  // Identifikasi duplikat
  semuaJadwal.forEach((jadwal) => {
    const key = `${jadwal.hari}_${jadwal.jam_mulai}_${jadwal.jam_selesai}_${jadwal.mata_kuliah_id?._id}_${jadwal.ruang_id?._id}`;

    if (seen.has(key)) {
      duplikatIds.push(jadwal._id);
      console.log(`❌ Ditemukan duplikat: ${key}`);
    } else {
      seen.add(key);
    }
  });

  // Hapus duplikat
  if (duplikatIds.length > 0) {
    await Jadwal.deleteMany({ _id: { $in: duplikatIds } });
    console.log(`✅ Menghapus ${duplikatIds.length} data duplikat`);
  } else {
    console.log("✅ Tidak ditemukan data duplikat");
  }

  return duplikatIds.length;
};
