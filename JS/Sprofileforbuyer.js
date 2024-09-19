 // Chart for Total Listings
 var ctx1 = document.getElementById('totalListingsChart').getContext('2d');
 var totalListingsChart = new Chart(ctx1, {
     type: 'doughnut',
     data: {
         datasets: [{
             data: [1200,1700],
             backgroundColor: ['#2ecc71', '#e5e5e5'],
             borderWidth: 2
         }]
     },
     options: {
         cutout: '70%',
         responsive: false,
         plugins: {
             legend: { display: false }
         }
     }
 });

 // Chart for Properties Sold
 var ctx2 = document.getElementById('propertiesSoldChart').getContext('2d');
 var propertiesSoldChart = new Chart(ctx2, {
     type: 'doughnut',
     data: {
         datasets: [{
             data: [900, 300],
             backgroundColor: ['#e74c3c', '#e5e5e5'],
             borderWidth: 2
         }]
     },
     options: {
         cutout: '70%',
         responsive: false,
         plugins: {
             legend: { display: false }
         }
     }
 });

 // Chart for Properties Rent
 var ctx3 = document.getElementById('propertiesRentChart').getContext('2d');
 var propertiesRentChart = new Chart(ctx3, {
     type: 'doughnut',
     data: {
         datasets: [{
             data: [300, 900],
             backgroundColor: ['#3498db', '#e5e5e5'],
             borderWidth: 2
         }]
     },
     options: {
         cutout: '70%',
         responsive: false,
         plugins: {
             legend: { display: false }
         }
     }
 });