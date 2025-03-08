const sidebar = document.getElementById("sidebar");
const toggleSidebarBtn = document.getElementById("toggleSidebar");

toggleSidebarBtn.addEventListener("click", function () {
  sidebar.classList.toggle("active");
  toggleSidebarBtn.classList.toggle("active");
});

function toggleSubmenu(id) {
  document.getElementById(id).classList.toggle("show");
}

function showPage(pageId, element) {
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

      // isi disini untuk fungsi baru

      // Fokus ke input pencarian saat Select2 dibuka
      $(".select2").on("select2:open", function () {
        let searchField = document.querySelector(
          ".select2-container--open .select2-search__field"
        );
        if (searchField) {
          searchField.focus();
        }
      });
      //flatpicker
      $(function () {
        flatpickr(".datepicker", {
          dateFormat: "Y-m-d",
          allowInput: true,
          theme: "dark",
        });
      });

      fetchPetugas();
    }
  }, 100);

  document.querySelectorAll(".menu-link").forEach((link) => {
    link.classList.remove("active");
  });
  element.classList.add("active");

  if (window.innerWidth <= 768) {
    sidebar.classList.remove("active");
    toggleSidebarBtn.classList.remove("active");
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
//   fetch(
//     "https://script.google.com/macros/s/AKfycbwRBFanMaw9jXrQgWJGamdBh67-gwbujZpsL1M8dqsScI3ZObygm47cpS7Yc0MTTVl5/exec",
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(formObject),
//       mode: "no-cors",
//     }
//   )
//     .then(() => {
//       Swal.fire({
//         icon: "success",
//         title: "Berhasil!",
//         text: "Data telah dikirim!",
//         timer: 2000,
//         showConfirmButton: false,
//       });

//       // Reset form setelah sukses
//       document.querySelector("form").reset();

//       // Reset Select2
//       $("#tempatPelayanan").val(null).trigger("change");
//       $("#namaPetugas").val(null).trigger("change");
//       $("#Jenis_kelamin").val(null).trigger("change");

//       submitBtn.innerHTML = `<i class="fas fa-feather"></i> Submit`;
//       submitBtn.disabled = false;
//     })
//     .catch((error) => {
//       console.error("Error:", error);

//       Swal.fire({
//         icon: "error",
//         title: "Oops!",
//         text: "Terjadi kesalahan, coba lagi!",
//       });

//       submitBtn.innerHTML = `<i class="fas fa-feather"></i> Submit`;
//       submitBtn.disabled = false;
//     });
// });
// Buat objek khusus untuk API kedua (hanya field tertentu)
let formObjectAPI2 = {
  Nama_pasien: formObject.Nama_pasien,
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

const ctx = document.getElementById("chartKunjungan").getContext("2d");
new Chart(ctx, {
  type: "line",
  data: {
    labels: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"],
    datasets: [
      {
        label: "Jumlah Kunjungan",
        data: [120, 135, 98, 110, 90, 80],
        borderColor: "#007bff",
        borderWidth: 2,
        fill: false,
      },
    ],
  },
});

//
// $(document).ready(function () {
//   const apiUrl =
//     "https://script.google.com/macros/s/AKfycbwRBFanMaw9jXrQgWJGamdBh67-gwbujZpsL1M8dqsScI3ZObygm47cpS7Yc0MTTVl5/exec";

//   let dtInstance;

//   function loadData() {
//     fetch(apiUrl)
//       .then((response) => response.json())
//       .then((data) => {
//         if (data.length === 0) return;

//         const headers = Object.keys(data[0]).slice(1, 9); // Ambil kolom kecuali ID
//         headers.push("Action"); // Tambahkan kolom Action

//         const newData = data.map((row) => {
//           let rowData = headers.slice(0, 8).map((key) => row[key]); // Data utama tanpa ID

//           // Tambahkan tombol view di kolom terakhir dengan ID tersembunyi
//           rowData.push(`
//             <button class="btn btn-primary btn-sm view-btn" data-id="${row.ID}">View</button>
//           `);

//           return rowData;
//         });

//         if (dtInstance) {
//           dtInstance.clear();
//           dtInstance.rows.add(newData);
//           dtInstance.draw(false);
//         } else {
//           dtInstance = $("#dataTable").DataTable({
//             data: newData,
//             columns: headers.map((header) => ({
//               title: header.replace(/_/g, " "),
//             })),
//             columnDefs: [
//               { targets: 0, visible: false, searchable: false }, // Sembunyikan kolom ID
//             ],
//             responsive: true,
//             autoWidth: false,
//             paging: true,
//           });
//         }

//         // Event listener untuk tombol "View"
//         $("#dataTable tbody")
//           .off("click")
//           .on("click", ".view-btn", function () {
//             let id = $(this).data("id");
//             let selectedData = data.find((row) => row.ID == id);
//             showDataModal(selectedData);
//           });
//       })
//       .catch((error) => console.error("Error fetching data:", error));
//   }

//   function showDataModal(data) {
//     let modalBody = $("#modalDataBody");
//     modalBody.empty();

//     Object.keys(data).forEach((key) => {
//       modalBody.append(`
//         <tr>
//           <th>${key.replace(/_/g, " ")}</th>
//           <td>${data[key]}</td>
//         </tr>
//       `);
//     });

//     $("#dataModal").modal("show");
//   }

//   loadData();
//   setInterval(loadData, 5000);
// });
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

        const newData = data.map((row) => {
          let rowData = headers.slice(0, 8).map((key) => row[key]); // Data utama tanpa ID

          // Tambahkan tombol View dan Delete dengan ID tersembunyi
          rowData.push(`
            <button class="btn btn-primary btn-sm view-btn" data-id="${row.ID}">View</button>
            <button class="btn btn-danger btn-sm delete-btn" data-id="${row.ID}">Delete</button>
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
$("#Nama_pasien").autocomplete({
  minLength: 3,
  source: function (request, response) {
    $("#loadingIcon").show(); // Tampilkan spinner sebelum request

    $.ajax({
      url: "https://script.google.com/macros/s/AKfycbwyy-oAsnZN_D6wfKOBOGDWXfhS-w51-BGi6sedh53y-z0kQoFRPgP6_OXfa6LFQ-mh/exec",
      type: "GET",
      dataType: "json",
      success: function (data) {
        console.log("Data API diterima:", data);

        let keyword = request.term.toLowerCase();
        let filteredData = data.filter((item) => {
          let nama = item.Nama_pasien.toLowerCase();
          return nama.includes(keyword) || nama.startsWith(keyword);
        });

        if (filteredData.length === 0) {
          console.log("🔴 Tidak ada hasil, mempertahankan input...");
          response([{ label: request.term, value: request.term }]);
        } else {
          let namaList = filteredData.map((item) => ({
            label: item.Nama_pasien,
            value: item.Nama_pasien,
            data: item,
          }));
          console.log("🟢 Data untuk autocomplete:", namaList);
          response(namaList);
        }
      },
      complete: function () {
        $("#loadingIcon").hide(); // Sembunyikan spinner setelah selesai
      },
      error: function () {
        console.log("🔴 Gagal mengambil data dari API");
        $("#loadingIcon").hide();
      },
    });
  },
  select: function (event, ui) {
    console.log("Pasien Dipilih:", ui.item);
    if (ui.item.data) {
      let pasien = ui.item.data;

      // Isi modal dengan data pasien
      $("#modalNama").text(pasien.Nama_pasien || "-");
      $("#modalTglLahir").text(formatTanggal(pasien.Tgl_lahir));
      $("#modalUsia").text(pasien.Usia || "-");
      $("#modalJK").text(
        pasien.Jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"
      );
      $("#modalAlamat").text(pasien.Alamat || "-");
      $("#modalTB").text(pasien.Tinggi_badan || "-");
      $("#modalBB").text(pasien.Berat_badan || "-");
      $("#modalIMT").text(pasien.Imt || "-");
      $("#modalHasilImt").text(pasien.Hasil_imt || "-");
      $("#modalLingkarP").text(pasien.Lingkar_perut || "-");
      $("#modalObesitas").text(pasien.Hasil_obesitas || "-");
      $("#modalSistol").text(pasien.Sistol || "-");
      $("#modalDiastol").text(pasien.Diastol || "-");
      $("#modalHT").text(pasien.Hasil_HT || "-");
      $("#modalCholesterol").text(pasien.Cholesterol || "-");
      $("#modalStroke").text(pasien.Hasil_Stroke || "-");

      // Simpan data pasien sementara di modal
      $("#modalPasien").data("selectedPasien", pasien);

      // Tampilkan modal
      setTimeout(function () {
        $("#modalPasien").modal("show");
      }, 300);
    }

    return false; // Hindari pengisian otomatis oleh autocomplete
  },
});

// Fungsi untuk mengubah format tanggal
function formatTanggal(tanggal) {
  if (!tanggal) return "-";
  let dateObj = new Date(tanggal);
  let tahun = dateObj.getFullYear();
  let bulan = String(dateObj.getMonth() + 1).padStart(2, "0"); // Bulan dimulai dari 0
  let hari = String(dateObj.getDate()).padStart(2, "0");
  return `${tahun}-${bulan}-${hari}`;
}

// Event delegation untuk memastikan tombol bisa berfungsi
$(document).on("click", "#btnPilihData", function () {
  let pasien = $("#modalPasien").data("selectedPasien");

  if (pasien) {
    setTimeout(function () {
      $("#Nama_pasien").val(pasien.Nama_pasien).trigger("change"); // Gunakan setTimeout & trigger
      $("#Tgl_lahir").val(formatTanggal(pasien.Tgl_lahir) || "");
      $("#Usia").val(pasien.Usia || "");
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

      console.log("✅ Nama pasien terisi:", $("#Nama_pasien").val()); // Debugging

      // Pastikan input tetap fokus
      $("#Nama_pasien").focus();
    }, 300); // Tunggu 300ms agar tidak ditimpa autocomplete

    // Tutup modal setelah memilih data
    $("#modalPasien").modal("hide");
  }
});

// Perbaiki Fokus Setelah Modal Ditutup
$("#modalPasien").on("hidden.bs.modal", function () {
  $("#Nama_pasien").focus();
});
