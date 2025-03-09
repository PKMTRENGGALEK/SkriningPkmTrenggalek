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
// Buat objek khusus untuk API kedua (hanya field tertentu)
let formObjectAPI2 = {
  Nama_pasien: formObject.Nama_pasien,
  NIK:formObject.NIK,
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
        const apiUrl = "https://script.google.com/macros/s/AKfycbwRBFanMaw9jXrQgWJGamdBh67-gwbujZpsL1M8dqsScI3ZObygm47cpS7Yc0MTTVl5/exec";
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.length) {
            // ========== 📌 CHART USIA ==========
            let usiaCounts = {};
            data.forEach(row => {
                if (row.Usia !== undefined && row.Usia !== null) {
                    let usia = String(row.Usia).trim();
                    if (!isNaN(usia) && usia !== "") {
                        usiaCounts[usia] = (usiaCounts[usia] || 0) + 1;
                    }
                }
            });

            let usiaLabels = Object.keys(usiaCounts).map(Number).sort((a, b) => a - b);
            let usiaData = usiaLabels.map(usia => usiaCounts[usia]);

            if (window.chartUsia) window.chartUsia.destroy();
            const ctxUsia = document.getElementById("chartKunjungan").getContext("2d");
            window.chartUsia = new Chart(ctxUsia, {
                type: "line",
                data: {
                    labels: usiaLabels,
                    datasets: [{
                        label: "Jumlah Pasien per Usia",
                        data: usiaData,
                        borderColor: "#007bff",
                        borderWidth: 2,
                        fill: false,
                    }],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false, // Fix ukuran
                    scales: {
                        x: { title: { display: true, text: "Usia" } },
                        y: { title: { display: true, text: "Jumlah Pasien" }, beginAtZero: true }
                    }
                }
            });

            // ========== 📌 CHART JENIS KELAMIN ==========
            let countLaki = 0, countPerempuan = 0;
            data.forEach(row => {
                if (row.Jenis_kelamin) {
                    let gender = row.Jenis_kelamin.trim().toUpperCase();
                    if (gender === "L") countLaki++;
                    else if (gender === "P") countPerempuan++;
                }
            });

            if (window.chartJenisKelamin) window.chartJenisKelamin.destroy();
            const ctxGender = document.getElementById("chartJeniskelamin").getContext("2d");
            window.chartJenisKelamin = new Chart(ctxGender, {
                type: "bar",
                data: {
                    labels: ["Laki-laki", "Perempuan"],
                    datasets: [{
                        label: "Jumlah Pasien",
                        data: [countLaki, countPerempuan],
                        backgroundColor: ["#007bff", "#ff6384"],
                    }],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false, // Fix ukuran
                    scales: {
                        y: { beginAtZero: true }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
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
        return row[key];
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
$(document).ready(function () {
  $("#Nama_pasien").on("input", function () {
    let keyword = $(this).val().trim().toLowerCase();
    if (keyword.length < 3) {
      $("#listPasien").empty();
      return;
    }

    $("#loadingIcon").show();

    $.ajax({
      url: "https://script.google.com/macros/s/AKfycbwRBFanMaw9jXrQgWJGamdBh67-gwbujZpsL1M8dqsScI3ZObygm47cpS7Yc0MTTVl5/exec",
      type: "GET",
      dataType: "json",
      success: function (data) {
        console.log("Data API diterima:", data);
        let filteredData = data.filter((item) =>
          item.Nama_pasien.toLowerCase().includes(keyword)
        );

        if (filteredData.length > 0) {
          let listHtml = filteredData
            .map(
              (item) => `
            <li class="list-group-item pasien-item" data-pasien='${JSON.stringify(
              item
            )}'>
             Nama : ${item.Nama_pasien} | Tgl Lahir : ${formatTanggal(item.Tgl_lahir)} | Usia : ${item.Usia} | Jenis Kelamin : ${item.Jenis_kelamin}
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
      },
      complete: function () {
        $("#loadingIcon").hide();
      },
      error: function () {
        console.log("🔴 Gagal mengambil data dari API");
        $("#loadingIcon").hide();
      },
    });
  });

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

                let matchingData = response.filter(item => 
                    item.Nama_pasien.toLowerCase() === nama.toLowerCase() &&
                    item.NIK.toString() === nik.toString()
                );

                if (matchingData.length > 0) {
                    $("#badgeMatch, #notifContainer").fadeIn();
                    $("#badgeMatch").off("click").on("click", function () {
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
            }
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
                    <td>${new Date(item.Tgl_pelayanan).toLocaleDateString()}</td>
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
                destroy: true
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
        const apiUrl = "https://script.google.com/macros/s/AKfycbwRBFanMaw9jXrQgWJGamdBh67-gwbujZpsL1M8dqsScI3ZObygm47cpS7Yc0MTTVl5/exec";
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.length) {
            const today = new Date().toISOString().split("T")[0];
            let stats = { total: data.length, hariIni: 0, L: 0, P: 0 };

            data.forEach(row => {
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
    const apiUrl = "https://script.google.com/macros/s/AKfycbwRBFanMaw9jXrQgWJGamdBh67-gwbujZpsL1M8dqsScI3ZObygm47cpS7Yc0MTTVl5/exec";
    let dataset = [];

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data)) {
                dataset = data;
                const tahunList = data.map(item => item.Tgl_pelayanan.split("-")[0]);
                const bulanList = data.map(item => getMonthName(item.Tgl_pelayanan.split("-")[1]));
                const petugasList = data.map(item => item.Nama_petugas);

                populateSelect("tahun", tahunList);
                populateSelect("bulan", bulanList);
                populateSelect("petugas", petugasList);

                // Aktifkan Select2
                $(".select2").select2({
                    theme: "bootstrap4",
                    width: "100%",
                    minimumResultsForSearch: 0
                }).on("select2:select", updateTotalSkrining)
                .on("select2:open", function () {
                        setTimeout(() => {
                            let searchField = document.querySelector(".select2-container--open .select2-search__field");
                            if (searchField) searchField.focus();
                        }, 100);
                    });
            }
        })
        .catch(error => console.error("Error fetching data:", error));

    function populateSelect(selectId, values) {
        const selectElement = $("#" + selectId);
        if (!selectElement.length) return;

        selectElement.html(`<option value="">---- Pilih Data ----</option>`);

        [...new Set(values)].sort().forEach(value => {
            selectElement.append(new Option(value, value));
        });

        // Tambahkan event listener agar Select2 bisa memicu update
        selectElement.on("change", updateTotalSkrining);
    }

    function getMonthName(monthNumber) {
        const monthNames = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];
        return monthNames[parseInt(monthNumber, 10) - 1];
    }

    function getMonthNumber(monthName) {
        const monthNames = {
            "Januari": "01", "Februari": "02", "Maret": "03", "April": "04",
            "Mei": "05", "Juni": "06", "Juli": "07", "Agustus": "08",
            "September": "09", "Oktober": "10", "November": "11", "Desember": "12"
        };
        return monthNames[monthName];
    }

    function updateTotalSkrining() {
        const selectedTahun = $("#tahun").val();
        const selectedBulan = $("#bulan").val();
        const selectedPetugas = $("#petugas").val();

        const totalSkriningElement = $("#total-skrining");
        const totalSkrining18_59Element = $("#total-skrining-18-59");
        const totalSkrining60Element = $("#total-skrining-60");
        const totalskriningObesitas59Element = $("#Skriningobesitas-59");
        const totalskriningObesitas59TemuElement = $("#Skriningobesitas-59TEMU");
        const totalskriningObesitas60Element = $("#Skriningobesitas-60");
        const totalskriningObesitas60TemuElement = $("#obes60temu");
        const totalskriningHT59Element = $("#ht-59");
        const totalskriningHT59TemuElement = $("#ht-59temu");

        console.log("Updating total-skrining...");

        if (!totalSkriningElement.length || !totalSkrining18_59Element.length || !totalSkrining60Element.length) {
            console.error("Elemen tidak ditemukan!");
            return;
        }

        if (selectedTahun && selectedBulan && selectedPetugas) {
            const bulanNumber = getMonthNumber(selectedBulan);

            const filteredData = dataset.filter(item =>
                item.Tgl_pelayanan.startsWith(`${selectedTahun}-${bulanNumber}`) &&
                item.Nama_petugas.trim().toLowerCase() === selectedPetugas.trim().toLowerCase()
            );

            console.log("Filtered Data:", filteredData);

            // Hitung total berdasarkan usia
            const total18_59 = filteredData.filter(item =>  parseInt(item.Usia) <= 59).length;
            const total60 = filteredData.filter(item => parseInt(item.Usia) >= 60).length;
             // Hitung jumlah obesitas usia <= 59
            const totalObesitas59 = filteredData.filter(item => parseInt(item.Usia) <= 59 && item.Hasil_obesitas).length;
            const totalObesitas59Temu = filteredData.filter(item => parseInt(item.Usia) <= 59 && item.Hasil_obesitas && item.Hasil_obesitas.toLowerCase() === "obesitas").length;
            const totalObesitas60 = filteredData.filter(item => parseInt(item.Usia) >= 60 && item.Hasil_obesitas).length;
            const totalObesitas60Temu = filteredData.filter(item => parseInt(item.Usia) >= 60 && item.Hasil_obesitas && item.Hasil_obesitas.toLowerCase() === "obesitas").length;
            const totalHt59 = filteredData.filter(item => parseInt(item.Usia) <= 59 && item.Hasil_HT).length;
            const totalHt59Temu = filteredData.filter(item => parseInt(item.Usia) <= 59 && item.Hasil_HT && item.Hasil_HT.toLowerCase() === "Hipertensi").length;
            // Update tampilan
            totalSkriningElement.text(filteredData.length);
            totalSkrining18_59Element.text(total18_59);
            totalSkrining60Element.text(total60);
            totalskriningObesitas59Element.text(totalObesitas59);
            totalskriningObesitas59TemuElement.text(totalObesitas59Temu);
            totalskriningObesitas60Element.text(totalObesitas60);
            totalskriningObesitas60TemuElement.text(totalObesitas60Temu);
            totalskriningHT59Element.text(totalHt59);
            totalskriningHT59TemuElement.text(totalHt59Temu);
            // Pastikan elemen terlihat
            totalSkriningElement.show();
            totalSkrining18_59Element.show();
            totalSkrining60Element.show();
            totalskriningObesitas59Element.show();
            totalskriningObesitas59TemuElement.show();
             totalskriningObesitas60Element.show();
            totalskriningObesitas60TemuElement.show();
            totalskriningHT59Element.show();
            totalskriningHT59TemuElement.show();
        } else {
            totalSkriningElement.text("0");
            totalSkrining18_59Element.text("0");
            totalSkrining60Element.text("0");
            totalskriningObesitas59Element.text("0");
            totalskriningObesitas59TemuElement.text("0");
            totalskriningObesitas60Element.text("0");
            totalskriningObesitas60TemuElement.text("0");
            totalskriningHT59Element.text("0");
            totalskriningHT59TemuElement.text("0");
        }
    }
});


