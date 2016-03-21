console.log("HEYO, SCRIPT IS GO!");
var form = document.getElementById("logout-form");

if (form) {
  document.getElementById("log-out").addEventListener("click", function () {
    console.log("YARP");
    form.submit();
  });
}
