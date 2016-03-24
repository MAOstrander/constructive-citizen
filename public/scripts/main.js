var form = document.getElementById("logout-form");

if (form) {
  document.getElementById("log-out").addEventListener("click", function () {
    form.submit();
  });
}


var modal = document.getElementById("myModal");

if (modal) {
  document.getElementById("edit-address").addEventListener("click", function () {

    // $.ajax({
    //    url: '/edit-address',
    //    type: 'PUT',
    //    data: 'whattosend'
    // }).done(function( data ) {
    //   console.log(data);
    //   location.reload();
    // });
  });
}


