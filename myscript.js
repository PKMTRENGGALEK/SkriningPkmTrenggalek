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
              $(function() {
              flatpickr(".datepicker", {
                dateFormat: "Y-m-d",
                allowInput: true,
                theme:"dark"
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
  fetch("https://script.google.com/macros/s/AKfycbxvtJa6If4-YcY8vvzZ-J5IPwtWE2NQmhxAw9Ydb3V6baseeQdPaG6Y7J3DZECYe79oSQ/exec")
    .then(response => response.json())
    .then(data => {
      let select = document.getElementById("namaPetugas");
      select.innerHTML = '<option value="">-- Pilih Nama Petugas --</option>'; // Reset options
      data.forEach(item => {
        let option = document.createElement("option");
        option.value = item.NAMA;
        option.textContent = item.NAMA;
        select.appendChild(option);
      });
     
    })
    .catch(error => console.error("Error fetching data:", error));
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
    let isValid = requiredFields.every(field => formObject[field]);

    if (!isValid) {
        Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Harap isi semua kolom sebelum mengirim!',
        });

        submitBtn.innerHTML = `<i class="fas fa-feather"></i> Submit`;
        submitBtn.disabled = false;
        return;
    }

    // Kirim data ke Google Sheets menggunakan Fetch API
    fetch("https://script.google.com/macros/s/AKfycbwRBFanMaw9jXrQgWJGamdBh67-gwbujZpsL1M8dqsScI3ZObygm47cpS7Yc0MTTVl5/exec", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formObject),
        mode: "no-cors"
    })
    .then(() => {
        Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Data telah dikirim!',
            timer: 2000,
            showConfirmButton: false
        });

        // Reset form setelah sukses
		    document.querySelector("form").reset();

		    // Reset Select2
		    $('#tempatPelayanan').val(null).trigger('change');
		    $('#namaPetugas').val(null).trigger('change');
		    $('#Jenis_kelamin').val(null).trigger('change');

	        submitBtn.innerHTML = `<i class="fas fa-feather"></i> Submit`;
	        submitBtn.disabled = false;
	    })
		.catch(error => {
        console.error("Error:", error);

        Swal.fire({
            icon: 'error',
            title: 'Oops!',
            text: 'Terjadi kesalahan, coba lagi!',
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
        if (!tinggiInput || !beratInput || !imtInput || !hasilImtInput || !jenisKelaminInput) return;
        
        let tinggi = parseFloat(tinggiInput.value);
        let berat = parseFloat(beratInput.value);

        if (isNaN(tinggi) || isNaN(berat) || tinggi === 0) {
            hasilImtInput.value = "";
            imtInput.value = "";
            obesitasInput.value = "";
            return;
        }

        let imt = berat / ((tinggi / 100) ** 2);
        let imtFixed = imt.toFixed(2);

        imtInput.value = imtFixed;
        hasilImtInput.value = kategoriIMT(imtFixed, jenisKelaminInput.value);
        hitungObesitas();
    }

    function kategoriIMT(imt, jenisKelamin) {
        if (!jenisKelamin) return "";
        
        if ((jenisKelamin === "L" && imt < 18.5) || (jenisKelamin === "P" && imt < 17)) {
            return "Kurang";
        } else if ((jenisKelamin === "L" && imt < 25) || (jenisKelamin === "P" && imt >= 17 && imt < 25)) {
            return "Normal";
        } else if ((jenisKelamin === "L" && imt < 30) || (jenisKelamin === "P" && imt < 27)) {
            return "Lebih";
        } else {
            return "Obesitas";
        }
    }

    function hitungObesitas() {
        if (!lingkarPerutInput || !imtInput || !obesitasInput || !jenisKelaminInput) return;
        
        let lingkarPerut = parseFloat(lingkarPerutInput.value);
        let imt = parseFloat(imtInput.value);
        let jenisKelamin = jenisKelaminInput.value;

        if (isNaN(lingkarPerut) || isNaN(imt) || !jenisKelamin || imt <= 0) {
            obesitasInput.value = "";
            return;
        }

        let lingkarObesitas = (jenisKelamin === "L" && lingkarPerut >= 90) || (jenisKelamin === "P" && lingkarPerut >= 80);
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
        if ((usia >= 18 && usia <= 65 && (sistol >= 130 || diastol >= 80)) || (usia > 65 && (sistol >= 140 || diastol >= 80))) {
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

const ctx = document.getElementById('chartKunjungan').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
            datasets: [{
                label: 'Jumlah Kunjungan',
                data: [120, 135, 98, 110, 90, 80],
                borderColor: '#007bff',
                borderWidth: 2,
                fill: false
            }]
        }
    });

     // document.addEventListener("DOMContentLoaded", function () {
     //        const API_URL = "https://script.google.com/macros/s/AKfycbwRBFanMaw9jXrQgWJGamdBh67-gwbujZpsL1M8dqsScI3ZObygm47cpS7Yc0MTTVl5/exec"; // Ganti dengan URL Google Apps Script Web App
            
     //        fetch(API_URL)
     //            .then(response => response.json())
     //            .then(data => {
     //                if (data.length === 0) return;
                    
     //                // Ambil header dari objek pertama
     //                const headers = Object.keys(data[0]);
     //                const thead = document.getElementById("table-head");
     //                const tbody = document.getElementById("table-body");
                    
     //                // Buat baris header
     //                let headerRow = "<tr>" + headers.map(h => `<th>${h.replace(/_/g, ' ')}</th>`).join('') + "</tr>";
     //                thead.innerHTML = headerRow;
                    
     //                // Isi tabel dengan data
     //                data.forEach(row => {
     //                    let rowHTML = "<tr>" + headers.map(h => `<td>${row[h]}</td>`).join('') + "</tr>";
     //                    tbody.innerHTML += rowHTML;
     //                });
     //            })
     //            .catch(error => console.error("Error fetching data:", error));
     //    });
     $(document).ready(function () {
        const apiUrl = "https://script.google.com/macros/s/AKfycbwRBFanMaw9jXrQgWJGamdBh67-gwbujZpsL1M8dqsScI3ZObygm47cpS7Yc0MTTVl5/exec"; // Ganti dengan URL Google Apps Script
        
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.length === 0) return;
                
                // Generate Table Headers
                let headers = Object.keys(data[0]);
                let theadHTML = headers.map(header => `<th>${header.replace(/_/g, ' ')}</th>`).join('');
                $("#tableHead").html(theadHTML);

                // Generate Table Rows
                let tbodyHTML = data.map(row => {
                    let rowData = headers.map(key => `<td>${row[key]}</td>`).join('');
                    return `<tr>${rowData}</tr>`;
                }).join('');
                $("#tableBody").html(tbodyHTML);

                // Initialize DataTables
                $('#dataTable').DataTable();
            })
            .catch(error => console.error("Error fetching data:", error));
    });
