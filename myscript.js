const sidebar = document.getElementById("sidebar");
const toggleSidebarBtn = document.getElementById("toggleSidebar");

// Toggle sidebar
toggleSidebarBtn.addEventListener("click", function () {
  sidebar.classList.toggle("active");
  toggleSidebarBtn.classList.toggle("active");
});

function toggleSubmenu(id) {
  const submenu = document.getElementById(id);
  const isOpen = submenu.classList.contains("show");

  // Tutup semua submenu terlebih dahulu
  document.querySelectorAll(".submenu").forEach((s) => {
    s.classList.remove("show");
  });

  // Jika submenu sebelumnya tidak terbuka, maka buka
  if (!isOpen) {
    submenu.classList.add("show");
  }
}

function showPage(pageId, element) {
  // Tutup semua halaman sebelum menampilkan yang baru
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active");
  });

  setTimeout(() => {
    document.getElementById(pageId).classList.add("active");

    if (pageId === "skriningDewasa") {
      // Inisialisasi Select2 jika ada
      $(".select2").select2({
        theme: "bootstrap4",
        placeholder: function () {
          return $(this).data("placeholder");
        },
        allowClear: true,
      });

      // Fokus ke input pencarian saat Select2 dibuka
      $(".select2").on("select2:open", function () {
        let searchField = document.querySelector(
          ".select2-container--open .select2-search__field"
        );
        if (searchField) {
          searchField.focus();
        }
      });

      // Flatpickr
      flatpickr(".datepicker", {
        dateFormat: "Y-m-d",
        allowInput: true,
        theme: "dark",
      });

      fetchPetugas();
    }
  }, 100);

  // Hapus kelas aktif dari semua menu-link dan tambahkan ke yang diklik
  document.querySelectorAll(".menu-link").forEach((link) => {
    link.classList.remove("active");
  });
  element.classList.add("active");

  // Tutup sidebar jika layar kecil
  if (window.innerWidth <= 768) {
    sidebar.classList.remove("active");
    toggleSidebarBtn.classList.remove("active");
  }

  // Tutup semua submenu kecuali jika submenu dari menu yang diklik
  if (!element.closest(".submenu")) {
    document.querySelectorAll(".submenu").forEach((submenu) => {
      submenu.classList.remove("show");
    });
  }
}

function fetchPetugas() {
  fetch(
    "https://script.google.com/macros/s/AKfycbxvtJa6If4-YcY8vvzZ-J5IPwtWE2NQmhxAw9Ydb3V6baseeQdPaG6Y7J3DZECYe79oSQ/exec"
  )
    .then((response) => response.json())
    .then((data) => {
      let select = document.getElementById("namaPetugas");
      select.innerHTML = '<option value="">-- Pilih Nama Petugas --</option>'; // Reset options
      data.forEach((item) => {
        let option = document.createElement("option");
        option.value = item.NAMA;
        option.textContent = item.NAMA;
        select.appendChild(option);
      });
    })
    .catch((error) => console.error("Error fetching data:", error));
}

// Fungsi input data
document.getElementById("btnFetch").addEventListener("click", function (e) {
  e.preventDefault();

  let submitBtn = document.getElementById("btnFetch");
  submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Mengirim...`;
  submitBtn.disabled = true;

  // Ambil form berdasarkan ID
  let form = document.getElementById("myForm");
  let formData = new FormData(form);

  // Konversi FormData ke objek JavaScript
  let formObject = {};
  formData.forEach((value, key) => {
    formObject[key] = value.trim();
  });

  // Validasi input wajib
  let requiredFields = ["tempatPelayanan", "namaPetugas", "tanggal"];
  let isValid = requiredFields.every((field) => formObject[field]);

  if (!isValid) {
    Swal.fire({
      icon: "warning",
      title: "Oops...",
      text: "Harap isi semua kolom sebelum mengirim!",
    });

    submitBtn.innerHTML = `<i class="fas fa-feather"></i> Submit`;
    submitBtn.disabled = false;
    return;
  }

  // Kirim data ke Google Sheets menggunakan Fetch API
  // Buat objek khusus untuk API kedua (hanya field tertentu)
  let formObjectAPI2 = {
    Nama_pasien: formObject.Nama_pasien,
    NIK: formObject.NIK,
    Tgl_lahir: formObject.Tgl_lahir,
    Usia: formObject.Usia,
    Jenis_kelamin: formObject.Jenis_kelamin,
    Alamat: formObject.Alamat,
    RT: formObject.RT,
  };
  Promise.all([
    fetch(
      "https://script.google.com/macros/s/AKfycbwRBFanMaw9jXrQgWJGamdBh67-gwbujZpsL1M8dqsScI3ZObygm47cpS7Yc0MTTVl5/exec",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formObject),
        mode: "no-cors",
      }
    ),
    fetch(
      "https://script.google.com/macros/s/AKfycbwyy-oAsnZN_D6wfKOBOGDWXfhS-w51-BGi6sedh53y-z0kQoFRPgP6_OXfa6LFQ-mh/exec",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formObjectAPI2),
        mode: "no-cors",
      }
    ),
  ])
    .then(() => {
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data telah dikirim ke dua API!",
        timer: 2000,
        showConfirmButton: false,
      });
      document.querySelector("form").reset();
      $("#tempatPelayanan").val(null).trigger("change");
      $("#namaPetugas").val(null).trigger("change");
      $("#Jenis_kelamin").val(null).trigger("change");
      submitBtn.innerHTML = `<i class="fas fa-feather"></i> Submit`;
      submitBtn.disabled = false;
    })
    .catch((error) => {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Terjadi kesalahan, coba lagi!",
      });
      submitBtn.innerHTML = `<i class="fas fa-feather"></i> Submit`;
      submitBtn.disabled = false;
    });
});

document.getElementById("Tgl_lahir").addEventListener("change", function () {
  let tglLahir = this.value; // Ambil nilai tanggal lahir
  let usiaInput = document.getElementById("Usia");

  if (tglLahir) {
    let today = new Date();
    let birthDate = new Date(tglLahir);
    let usia = today.getFullYear() - birthDate.getFullYear();
    let monthDiff = today.getMonth() - birthDate.getMonth();
    let dayDiff = today.getDate() - birthDate.getDate();

    // Jika bulan atau tanggal lahir belum lewat dalam tahun ini, kurangi usia
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      usia--;
    }

    usiaInput.value = usia; // Tampilkan usia di input
  } else {
    usiaInput.value = ""; // Kosongkan jika tanggal lahir tidak diisi
  }
});

// logic hitung IMT
document.addEventListener("DOMContentLoaded", function () {
  let tinggiInput = document.getElementById("Tinggi_badan");
  let beratInput = document.getElementById("Berat_badan");
  let imtInput = document.getElementById("IMT");
  let hasilImtInput = document.getElementById("Hasil_imt");
  let jenisKelaminInput = document.getElementById("Jenis_kelamin");
  let lingkarPerutInput = document.getElementById("Lingkarp");
  let obesitasInput = document.getElementById("obes");
  let sistolInput = document.getElementById("Sistol");
  let diastolInput = document.getElementById("Diastol");
  let usiaInput = document.getElementById("Usia");
  let hasilHTInput = document.getElementById("HasilHT");
  // let lingkarPerutInput = document.getElementById("Lingkarp");

  function hitungIMT() {
    if (
      !tinggiInput ||
      !beratInput ||
      !imtInput ||
      !hasilImtInput ||
      !jenisKelaminInput
    )
      return;

    let tinggi = parseFloat(tinggiInput.value);
    let berat = parseFloat(beratInput.value);

    if (isNaN(tinggi) || isNaN(berat) || tinggi === 0) {
      hasilImtInput.value = "";
      imtInput.value = "";
      obesitasInput.value = "";
      return;
    }

    let imt = berat / (tinggi / 100) ** 2;
    let imtFixed = imt.toFixed(2);

    imtInput.value = imtFixed;
    hasilImtInput.value = kategoriIMT(imtFixed, jenisKelaminInput.value);
    hitungObesitas();
  }

  function kategoriIMT(imt, jenisKelamin) {
    if (!jenisKelamin) return "";

    if (
      (jenisKelamin === "L" && imt < 18.5) ||
      (jenisKelamin === "P" && imt < 17)
    ) {
      return "Kurang";
    } else if (
      (jenisKelamin === "L" && imt < 25) ||
      (jenisKelamin === "P" && imt >= 17 && imt < 25)
    ) {
      return "Normal";
    } else if (
      (jenisKelamin === "L" && imt < 30) ||
      (jenisKelamin === "P" && imt < 27)
    ) {
      return "Lebih";
    } else {
      return "Obesitas";
    }
  }

  function hitungObesitas() {
    if (!lingkarPerutInput || !imtInput || !obesitasInput || !jenisKelaminInput)
      return;

    let lingkarPerut = parseFloat(lingkarPerutInput.value);
    let imt = parseFloat(imtInput.value);
    let jenisKelamin = jenisKelaminInput.value;

    if (isNaN(lingkarPerut) || isNaN(imt) || !jenisKelamin || imt <= 0) {
      obesitasInput.value = "";
      return;
    }

    let lingkarObesitas =
      (jenisKelamin === "L" && lingkarPerut >= 90) ||
      (jenisKelamin === "P" && lingkarPerut >= 80);
    let hasil = "Normal";

    if (imt > 25 && imt <= 27) {
      hasil = "Gemuk (Overweight)";
    } else if (imt > 27) {
      hasil = "Obesitas";
    }

    if (lingkarObesitas && imt > 25) {
      hasil += " - Risiko Tinggi";
    }

    obesitasInput.value = hasil;
  }
  // Tambahkan event listener
  lingkarPerutInput.addEventListener("input", hitungObesitas);
  imtInput.addEventListener("input", hitungObesitas);
  jenisKelaminInput.addEventListener("change", hitungObesitas);

  function hitungHasilHT() {
    if (!sistolInput || !diastolInput || !usiaInput || !hasilHTInput) return;

    let sistol = parseInt(sistolInput.value);
    let diastol = parseInt(diastolInput.value);
    let usia = parseInt(usiaInput.value);

    if (isNaN(sistol) || isNaN(diastol) || isNaN(usia)) {
      hasilHTInput.value = "";
      return;
    }

    let hasil = "NORMAL";
    if (
      (usia >= 18 && usia <= 65 && (sistol >= 130 || diastol >= 80)) ||
      (usia > 65 && (sistol >= 140 || diastol >= 80))
    ) {
      hasil = "Hipertensi";
    }

    hasilHTInput.value = hasil;
  }

  // Event Listener untuk update otomatis
  if (tinggiInput && beratInput) {
    tinggiInput.addEventListener("input", hitungIMT);
    beratInput.addEventListener("input", hitungIMT);
  }
  if (jenisKelaminInput) {
    jenisKelaminInput.addEventListener("change", hitungIMT);
  }
  if (lingkarPerutInput) {
    lingkarPerutInput.addEventListener("input", hitungObesitas);
  }
  if (sistolInput && diastolInput && usiaInput) {
    sistolInput.addEventListener("input", hitungHasilHT);
    diastolInput.addEventListener("input", hitungHasilHT);
    usiaInput.addEventListener("input", hitungHasilHT);
  }
  // Pastikan elemen ditemukan
  const cholesterolInput = document.getElementById("Cholesterol");
  const strokeInput = document.getElementById("stroke");

  // Fungsi deteksi stroke berdasarkan cholesterol
  function deteksiStroke() {
    if (!cholesterolInput || !strokeInput) return;

    let cholesterol = parseFloat(cholesterolInput.value);

    if (isNaN(cholesterol)) {
      strokeInput.value = "";
      return;
    }

    // Logika deteksi stroke
    if (cholesterol <= 200) {
      strokeInput.value = "Normal";
    } else {
      strokeInput.value = "Tidak Normal (Berisiko Stroke)";
    }
  }

  // Tambahkan event listener agar otomatis menghitung saat nilai berubah
  cholesterolInput.addEventListener("input", deteksiStroke);
});

// Chart
document.addEventListener("DOMContentLoaded", async function () {
  try {
    const apiUrl =
      "https://script.google.com/macros/s/AKfycbwRBFanMaw9jXrQgWJGamdBh67-gwbujZpsL1M8dqsScI3ZObygm47cpS7Yc0MTTVl5/exec";
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.length) {
      // ========== 📌 CHART USIA ==========
      let usiaCounts = {};
      data.forEach((row) => {
        if (row.Usia !== undefined && row.Usia !== null) {
          let usia = String(row.Usia).trim();
          if (!isNaN(usia) && usia !== "") {
            usiaCounts[usia] = (usiaCounts[usia] || 0) + 1;
          }
        }
      });

      let usiaLabels = Object.keys(usiaCounts)
        .map(Number)
        .sort((a, b) => a - b);
      let usiaData = usiaLabels.map((usia) => usiaCounts[usia]);

      if (window.chartUsia) window.chartUsia.destroy();
      const ctxUsia = document
        .getElementById("chartKunjungan")
        .getContext("2d");
      window.chartUsia = new Chart(ctxUsia, {
        type: "line",
        data: {
          labels: usiaLabels,
          datasets: [
            {
              label: "Jumlah Pasien per Usia",
              data: usiaData,
              borderColor: "#007bff",
              borderWidth: 2,
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false, // Fix ukuran
          scales: {
            x: { title: { display: true, text: "Usia" } },
            y: {
              title: { display: true, text: "Jumlah Pasien" },
              beginAtZero: true,
            },
          },
        },
      });

      // ========== 📌 CHART JENIS KELAMIN ==========
      let countLaki = 0,
        countPerempuan = 0;
      data.forEach((row) => {
        if (row.Jenis_kelamin) {
          let gender = row.Jenis_kelamin.trim().toUpperCase();
          if (gender === "L") countLaki++;
          else if (gender === "P") countPerempuan++;
        }
      });

      if (window.chartJenisKelamin) window.chartJenisKelamin.destroy();
      const ctxGender = document
        .getElementById("chartJeniskelamin")
        .getContext("2d");
      window.chartJenisKelamin = new Chart(ctxGender, {
        type: "bar",
        data: {
          labels: ["Laki-laki", "Perempuan"],
          datasets: [
            {
              label: "Jumlah Pasien",
              data: [countLaki, countPerempuan],
              backgroundColor: ["#007bff", "#ff6384"],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false, // Fix ukuran
          scales: {
            y: { beginAtZero: true },
          },
          plugins: {
            legend: { display: false },
          },
        },
      });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
});

// tampil report
$(document).ready(function () {
  const apiUrl =
    "https://script.google.com/macros/s/AKfycbwRBFanMaw9jXrQgWJGamdBh67-gwbujZpsL1M8dqsScI3ZObygm47cpS7Yc0MTTVl5/exec";

  let dtInstance;

  function loadData() {
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data.length === 0) return;

        const headers = Object.keys(data[0]).slice(1, 9); // Ambil kolom kecuali ID
        headers.push("Action"); // Tambahkan kolom Action

        // const newData = data.map((row) => {
        //   let rowData = headers.slice(0, 8).map((key) => row[key]); // Data utama tanpa ID
        const newData = data.map((row) => {
          let rowData = headers.slice(0, 8).map((key) => {
            if ((key === "Tgl_pelayanan" || key === "Tgl_lahir") && row[key]) {
              let date = new Date(row[key]);
              return date.toISOString().split("T")[0];
              // Format yyyy-mm-dd
            }
            return row[key] ?? "-";
          });
          // Tambahkan tombol View dan Delete dengan ID tersembunyi
          rowData.push(`
            <button class="btn btn-primary btn-sm view-btn shadow" data-id="${row.ID}">View</button>
            <button class="btn btn-danger btn-sm delete-btn shadow" data-id="${row.ID}">Delete</button>
          `);

          return rowData;
        });

        if (dtInstance) {
          dtInstance.clear();
          dtInstance.rows.add(newData);
          dtInstance.draw(false);
        } else {
          dtInstance = $("#dataTable").DataTable({
            data: newData,
            columns: headers.map((header) => ({
              title: header.replace(/_/g, " "),
            })),
            columnDefs: [{ targets: 0, visible: false, searchable: false }], // Sembunyikan kolom ID
            responsive: true,
            autoWidth: false,
            paging: true,
          });
        }

        // Event listener untuk tombol "View"
        $("#dataTable tbody")
          .off("click")
          .on("click", ".view-btn", function () {
            let id = $(this).data("id");
            let selectedData = data.find((row) => row.ID == id);
            showDataModal(selectedData);
          });

        // Event listener untuk tombol "Delete"
        $("#dataTable tbody").on("click", ".delete-btn", function () {
          let id = $(this).data("id");

          Swal.fire({
            title: "Apakah Anda yakin?",
            text: "Data akan dihapus secara permanen!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, hapus!",
            cancelButtonText: "Batal",
          }).then((result) => {
            if (result.isConfirmed) {
              deleteData(id);
            }
          });
        });
      })
      .catch((error) => console.error("Error fetching data:", error));
  }

  function showDataModal(data) {
    let modalBody = $("#modalDataBody");
    modalBody.empty();

    Object.keys(data).forEach((key) => {
      modalBody.append(`
        <tr>
          <th>${key.replace(/_/g, " ")}</th>
          <td>${data[key]}</td>
        </tr>
      `);
    });

    $("#dataModal").modal("show");
  }

  function deleteData(id) {
    const deleteUrl = `https://script.google.com/macros/s/AKfycbwRBFanMaw9jXrQgWJGamdBh67-gwbujZpsL1M8dqsScI3ZObygm47cpS7Yc0MTTVl5/exec?action=delete&ID=${id}`;

    // Tampilkan loading spinner
    Swal.fire({
      title: "Menghapus data...",
      text: "Mohon tunggu sebentar",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    fetch(deleteUrl, { method: "GET" }) // Gunakan GET untuk menghindari CORS
      .then((response) => response.json())
      .then((result) => {
        Swal.fire({
          title: "Berhasil!",
          text: result.message,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });

        loadData(); // Refresh tabel setelah menghapus
      })
      .catch((error) => {
        Swal.fire({
          title: "Error!",
          text: "Gagal menghapus data.",
          icon: "error",
        });
        console.error("Error deleting data:", error);
      });
  }

  loadData();
  setInterval(loadData, 3000);
});

// ambil nama pasiem autocomplete
// $(document).ready(function () {
//   $("#Nama_pasien").on("input", function () {
//     let keyword = $(this).val().trim().toLowerCase();
//     if (keyword.length < 3) {
//       $("#listPasien").empty();
//       return;
//     }

//     $("#loadingIcon").show();

//     $.ajax({
//       url: "https://script.google.com/macros/s/AKfycbwyy-oAsnZN_D6wfKOBOGDWXfhS-w51-BGi6sedh53y-z0kQoFRPgP6_OXfa6LFQ-mh/exec",
//       // https://script.google.com/macros/s/AKfycbwyy-oAsnZN_D6wfKOBOGDWXfhS-w51-BGi6sedh53y-z0kQoFRPgP6_OXfa6LFQ-mh/exec/
//       // https://script.google.com/macros/s/AKfycbwRBFanMaw9jXrQgWJGamdBh67-gwbujZpsL1M8dqsScI3ZObygm47cpS7Yc0MTTVl5/exec
//       type: "GET",
//       dataType: "json",
//       success: function (data) {
//         console.log("Data API diterima:", data);
//         let filteredData = data.filter((item) =>
//           item.Nama_pasien.toLowerCase().includes(keyword)
//         );

//         if (filteredData.length > 0) {
//           let listHtml = filteredData
//             .map(
//               (item) => `
//             <li class="list-group-item pasien-item" data-pasien='${JSON.stringify(
//               item
//             )}'>
//              Nama : ${item.Nama_pasien} | Tgl Lahir : ${formatTanggal(
//                 item.Tgl_lahir
//               )} | Usia : ${item.Usia} | Jenis Kelamin : ${item.Jenis_kelamin}
//             </li>`
//             )
//             .join("");
//           $("#listPasien").html(listHtml);
//           $("#modalListPasien").modal("show");
//         } else {
//           $("#listPasien").html(
//             '<li class="list-group-item text-muted">Tidak ada hasil</li>'
//           );
//         }
//       },
//       complete: function () {
//         $("#loadingIcon").hide();
//       },
//       error: function () {
//         console.log("🔴 Gagal mengambil data dari API");
//         $("#loadingIcon").hide();
//       },
//     });
//   });

//   $(document).on("click", ".pasien-item", function () {
//     let pasien = JSON.parse($(this).attr("data-pasien"));
//     $("#Nama_pasien").val(pasien.Nama_pasien).trigger("change");
//     $("#Tgl_lahir").val(formatTanggal(pasien.Tgl_lahir) || "");
//     $("#Usia").val(pasien.Usia || "");
//     $("#NIK").val(pasien.NIK || "");
//     $("#Jenis_kelamin").val(pasien.Jenis_kelamin).trigger("change");
//     $("#Alamat").val(pasien.Alamat || "");
//     $("#RT").val(pasien.RT || "");
//     $("#Tinggi_badan").val(pasien.Tinggi_badan || "");
//     $("#Berat_badan").val(pasien.Berat_badan || "");
//     $("#Hasil_imt").val(pasien.Hasil_imt || "");
//     $("#IMT").val(pasien.IMT || "");
//     $("#Lingkarp").val(pasien.Lingkar_perut || "");
//     $("#obes").val(pasien.Hasil_obesitas || "");
//     $("#Sistol").val(pasien.Sistol || "");
//     $("#Diastol").val(pasien.Diastol || "");
//     $("#HasilHT").val(pasien.Hasil_HT || "");
//     $("#Cholesterol").val(pasien.Cholesterol || "");
//     $("#stroke").val(pasien.Hasil_Stroke || "");
//     $("#modalListPasien").modal("hide");
//   });

//   $("#modalListPasien").on("hidden.bs.modal", function () {
//     $("#Nama_pasien").focus();
//   });
// });
$(document).ready(function () {
  let dataCache = [];
  let fuse;
  let debounceTimer;

  $("#Nama_pasien").on("input", function () {
    let keyword = $(this).val().trim().toLowerCase();
    if (keyword.length < 3) {
      $("#listPasien").empty();
      return;
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (dataCache.length > 0) {
        searchAndShowResults(keyword);
      } else {
        fetchDataFromAPI(keyword);
      }
    }, 300); // Debounce untuk mengurangi panggilan API
  });

  function fetchDataFromAPI(keyword) {
    $("#loadingIcon").show();

    $.ajax({
      url: "https://script.google.com/macros/s/AKfycbwyy-oAsnZN_D6wfKOBOGDWXfhS-w51-BGi6sedh53y-z0kQoFRPgP6_OXfa6LFQ-mh/exec",
      type: "GET",
      dataType: "json",
      success: function (data) {
        console.log("Data API diterima:", data);
        dataCache = data; // Simpan data untuk pencarian cepat
        fuse = new Fuse(dataCache, { keys: ["Nama_pasien"], threshold: 0.3 });
        searchAndShowResults(keyword);
      },
      complete: function () {
        $("#loadingIcon").hide();
      },
      error: function () {
        console.log("🔴 Gagal mengambil data dari API");
        $("#loadingIcon").hide();
      },
    });
  }

  function searchAndShowResults(keyword) {
    let results = fuse.search(keyword).map((result) => result.item);

    if (results.length > 0) {
      let listHtml = results
        .map(
          (item) => `
          <li class="list-group-item pasien-item" data-pasien='${JSON.stringify(
            item
          )}'>
            Nama : ${item.Nama_pasien} | Tgl Lahir : ${formatTanggal(
            item.Tgl_lahir
          )} | Usia : ${item.Usia} | Jenis Kelamin : ${item.Jenis_kelamin}
          </li>`
        )
        .join("");
      $("#listPasien").html(listHtml);
      $("#modalListPasien").modal("show");
    } else {
      $("#listPasien").html(
        '<li class="list-group-item text-muted">Tidak ada hasil</li>'
      );
    }
  }

  $(document).on("click", ".pasien-item", function () {
    let pasien = JSON.parse($(this).attr("data-pasien"));
    $("#Nama_pasien").val(pasien.Nama_pasien).trigger("change");
    $("#Tgl_lahir").val(formatTanggal(pasien.Tgl_lahir) || "");
    $("#Usia").val(pasien.Usia || "");
    $("#NIK").val(pasien.NIK || "");
    $("#Jenis_kelamin").val(pasien.Jenis_kelamin).trigger("change");
    $("#Alamat").val(pasien.Alamat || "");
    $("#RT").val(pasien.RT || "");
    $("#Tinggi_badan").val(pasien.Tinggi_badan || "");
    $("#Berat_badan").val(pasien.Berat_badan || "");
    $("#Hasil_imt").val(pasien.Hasil_imt || "");
    $("#IMT").val(pasien.IMT || "");
    $("#Lingkarp").val(pasien.Lingkar_perut || "");
    $("#obes").val(pasien.Hasil_obesitas || "");
    $("#Sistol").val(pasien.Sistol || "");
    $("#Diastol").val(pasien.Diastol || "");
    $("#HasilHT").val(pasien.Hasil_HT || "");
    $("#Cholesterol").val(pasien.Cholesterol || "");
    $("#stroke").val(pasien.Hasil_Stroke || "");
    $("#modalListPasien").modal("hide");
  });

  $("#modalListPasien").on("hidden.bs.modal", function () {
    $("#Nama_pasien").focus();
  });

  function formatTanggal(tgl) {
    if (!tgl) return "-";
    let date = new Date(tgl);
    return isNaN(date) ? "-" : date.toISOString().split("T")[0];
  }
  $(document).on("click", ".close", function () {
    $("#modalListPasien").modal("hide");
  });
});

function formatTanggal(tanggal) {
  if (!tanggal) return "-";
  let dateObj = new Date(tanggal);
  let tahun = dateObj.getFullYear();
  let bulan = String(dateObj.getMonth() + 1).padStart(2, "0");
  let hari = String(dateObj.getDate()).padStart(2, "0");
  return `${tahun}-${bulan}-${hari}`;
}

// check duplikat
$(document).ready(function () {
  $("#btnCheckDuplicate").on("click", function (event) {
    event.preventDefault(); // Mencegah reload halaman

    let nama = $("#Nama_pasien").val().trim();
    let nik = $("#NIK").val().trim();

    if (nama === "" || nik === "") {
      $("#notifContainer, #badgeMatch").fadeOut();
      return;
    }

    console.log("Memeriksa duplikasi untuk:", nama, nik);

    // Tambahkan animasi loading
    $("#loadingIcon").show();

    $.ajax({
      url: "https://script.google.com/macros/s/AKfycbwRBFanMaw9jXrQgWJGamdBh67-gwbujZpsL1M8dqsScI3ZObygm47cpS7Yc0MTTVl5/exec",
      type: "GET",
      dataType: "json",
      success: function (response) {
        $("#loadingIcon").hide();
        console.log("Respons API:", response);

        let matchingData = response.filter(
          (item) =>
            item.Nama_pasien.toLowerCase() === nama.toLowerCase() &&
            item.NIK.toString() === nik.toString()
        );

        if (matchingData.length > 0) {
          $("#badgeMatch, #notifContainer").fadeIn();
          $("#badgeMatch")
            .off("click")
            .on("click", function () {
              showModalWithTable(matchingData);
            });
        } else {
          $("#badgeMatch, #notifContainer").fadeOut();
        }
      },
      error: function (xhr, status, error) {
        $("#loadingIcon").hide();
        console.error("Terjadi kesalahan dalam pengecekan data:", error);
        alert("Gagal mengambil data. Silakan coba lagi.");
      },
    });
  });

  function showModalWithTable(data) {
    let tableBody = $("#tablePasien tbody");
    tableBody.empty();

    data.forEach((item) => {
      tableBody.append(`
                <tr>
                    <td>${item.Tempat_pelayanan}</td>
                    <td>${item.Nama_petugas}</td>
                    <td>${new Date(
                      item.Tgl_pelayanan
                    ).toLocaleDateString()}</td>
                    <td>${item.Nama_pasien}</td>
                    <td>${item.NIK}</td>
                    <td>${new Date(item.Tgl_lahir).toLocaleDateString()}</td>
                    <td>${item.Usia}</td>
                    <td>${item.Jenis_kelamin}</td>
                    <td>${item.Alamat}</td>
                    <td>${item.RT}</td>
                    <td>${item.Tinggi_badan}</td>
                    <td>${item.Berat_badan}</td>
                    <td>${item.Hasil_imt}</td>
                    <td>${item.Imt}</td>
                    <td>${item.Lingkar_perut}</td>
                    <td>${item.Hasil_obesitas}</td>
                </tr>
            `);
    });

    if (!$.fn.DataTable.isDataTable("#tablePasien")) {
      $("#tablePasien").DataTable({
        responsive: true,
        destroy: true,
      });
    } else {
      $("#tablePasien").DataTable().clear().rows.add(data).draw();
    }

    $("#modalDuplikat").modal("show");
  }
});

// data untuk dashboard

document.addEventListener("DOMContentLoaded", async function () {
  try {
    const apiUrl =
      "https://script.google.com/macros/s/AKfycbwRBFanMaw9jXrQgWJGamdBh67-gwbujZpsL1M8dqsScI3ZObygm47cpS7Yc0MTTVl5/exec";
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.length) {
      const today = new Date().toISOString().split("T")[0];
      let stats = { total: data.length, hariIni: 0, L: 0, P: 0 };

      data.forEach((row) => {
        if (row.Tgl_pelayanan === today) stats.hariIni++;
        let gender = row.Jenis_kelamin.trim().toUpperCase();
        if (gender === "L") stats.L++;
        else if (gender === "P") stats.P++;
      });

      // Fungsi untuk memperbarui teks & menghapus animasi loading
      function updateElement(id, value) {
        let element = document.getElementById(id);
        if (element) {
          element.innerText = value;
          element.classList.remove("loading"); // Hapus animasi loading
        }
      }

      updateElement("totalPasien", stats.total.toLocaleString());
      updateElement("pasienHariIni", stats.hariIni);
      updateElement("pasienLaki", stats.L);
      updateElement("pasienPerempuan", stats.P);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
});

// fungsi Rekap data
document.addEventListener("DOMContentLoaded", function () {
  const apiUrl =
    "https://script.google.com/macros/s/AKfycbwRBFanMaw9jXrQgWJGamdBh67-gwbujZpsL1M8dqsScI3ZObygm47cpS7Yc0MTTVl5/exec";
  let dataset = [];

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      if (Array.isArray(data)) {
        dataset = data;

        const tahunList = [
          ...new Set(data.map((item) => item.Tgl_pelayanan.split("-")[0])),
        ];
        const bulanList = [
          "Semua Bulan",
          ...new Set(
            data.map((item) => getMonthName(item.Tgl_pelayanan.split("-")[1]))
          ),
        ];
        const petugasList = [
          "Semua Petugas",
          ...new Set(data.map((item) => item.Nama_petugas)),
        ];

        populateSelect("tahun", tahunList);
        populateSelect("bulan", bulanList);
        populateSelect("petugas", petugasList);

        $(".select2")
          .select2({
            theme: "bootstrap4",
            width: "100%",
            minimumResultsForSearch: 0,
          })
          .on("select2:select", updateTotalSkrining)
          .on("select2:open", function () {
            setTimeout(() => {
              let searchField = document.querySelector(
                ".select2-container--open .select2-search__field"
              );
              if (searchField) searchField.focus();
            }, 100);
          });
      }
    })
    .catch((error) => console.error("Error fetching data:", error));

  function populateSelect(selectId, values, includeAllOption = false) {
    const selectElement = $("#" + selectId);
    if (!selectElement.length) return;

    // Set opsi default saat pertama kali dimuat
    let optionsHtml = `<option value="">---- Pilih Data ----</option>`;

    // Tambahkan opsi "Semua" jika diperlukan (untuk bulan & petugas)
    if (includeAllOption) {
      optionsHtml += `<option value="all">Semua</option>`;
    }

    // Tambahkan opsi lainnya
    const uniqueValues = [...new Set(values)].sort();
    uniqueValues.forEach((value) => {
      optionsHtml += `<option value="${value}">${value}</option>`;
    });

    selectElement.html(optionsHtml);
    selectElement.on("change", updateTotalSkrining);
  }
  function getMonthName(monthNumber) {
    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    return monthNames[parseInt(monthNumber, 10) - 1] || "";
  }

  function getMonthNumber(monthName) {
    const monthNames = {
      Januari: "01",
      Februari: "02",
      Maret: "03",
      April: "04",
      Mei: "05",
      Juni: "06",
      Juli: "07",
      Agustus: "08",
      September: "09",
      Oktober: "10",
      November: "11",
      Desember: "12",
    };
    return monthNames[monthName] || "00";
  }

  function updateTotalSkrining() {
    const selectedTahun = $("#tahun").val();
    const selectedBulan = $("#bulan").val();
    const selectedPetugas = $("#petugas").val();

    const elements = {
      totalSkrining: $("#total-skrining"),
      totalSkrining18_59: $("#total-skrining-18-59"),
      totalSkrining60: $("#total-skrining-60"),
      skriningObesitas59: $("#Skriningobesitas-59"),
      skriningObesitas59Temu: $("#Skriningobesitas-59TEMU"),
      skriningObesitas60: $("#Skriningobesitas-60"),
      skriningObesitas60Temu: $("#obes60temu"),
      skriningHT59: $("#ht-59"),
      skriningHT59Temu: $("#ht-59temu"),
      skriningHT60: $("#ht-60"),
      skriningHT60Temu: $("#ht-60temu"),
    };

    if (!selectedTahun) {
      resetElements(elements);

      return;
    }

    let filteredData = dataset.filter((item) => {
      if (!item.Tgl_pelayanan || !item.Usia) return false;

      const itemTahun = item.Tgl_pelayanan.split("-")[0];
      const itemBulan = item.Tgl_pelayanan.split("-")[1];

      let isValid = itemTahun === selectedTahun;

      if (selectedBulan !== "Semua Bulan") {
        isValid = isValid && itemBulan === getMonthNumber(selectedBulan);
      }

      if (selectedPetugas !== "Semua Petugas") {
        isValid =
          isValid &&
          item.Nama_petugas?.trim().toLowerCase() ===
            selectedPetugas.trim().toLowerCase();
      }

      return isValid;
    });

    console.log("Filtered Data:", filteredData);

    const getTotal = (condition) => filteredData.filter(condition).length;

    const total18_59 = getTotal(
      (item) => Number(item.Usia) && Number(item.Usia) <= 59
    );
    const total60 = getTotal(
      (item) => Number(item.Usia) && Number(item.Usia) >= 60
    );
    const totalObesitas59 = getTotal(
      (item) => Number(item.Usia) <= 59 && item.Hasil_obesitas
    );
    const totalObesitas59Temu = getTotal(
      (item) =>
        Number(item.Usia) <= 59 &&
        (item.Hasil_obesitas || "").toLowerCase() === "obesitas"
    );
    const totalObesitas60 = getTotal(
      (item) => Number(item.Usia) >= 60 && item.Hasil_obesitas
    );
    const totalObesitas60Temu = getTotal(
      (item) =>
        Number(item.Usia) >= 60 &&
        (item.Hasil_obesitas || "").toLowerCase() === "obesitas"
    );
    const totalHt59 = getTotal(
      (item) => Number(item.Usia) <= 59 && item.Hasil_HT
    );
    const totalHt59Temu = getTotal(
      (item) =>
        Number(item.Usia) <= 59 &&
        (item.Hasil_HT || "").toLowerCase() === "hipertensi"
    );
    const totalHt60 = getTotal(
      (item) => Number(item.Usia) >= 60 && item.Hasil_HT
    );
    const totalHt60Temu = getTotal(
      (item) =>
        Number(item.Usia) >= 60 &&
        (item.Hasil_HT || "").toLowerCase() === "hipertensi"
    );

    updateElements(elements, {
      totalSkrining: filteredData.length,
      totalSkrining18_59: total18_59,
      totalSkrining60: total60,
      skriningObesitas59: totalObesitas59,
      skriningObesitas59Temu: totalObesitas59Temu,
      skriningObesitas60: totalObesitas60,
      skriningObesitas60Temu: totalObesitas60Temu,
      skriningHT59: totalHt59,
      skriningHT59Temu: totalHt59Temu,
      skriningHT60: totalHt60,
      skriningHT60Temu: totalHt60Temu,
    });
  }

  function resetElements(elements) {
    Object.values(elements).forEach((el) => el.text("0").hide());
  }

  function updateElements(elements, data) {
    Object.keys(elements).forEach((key) => {
      elements[key].text(data[key]).show();
    });
  }
});
