var form = document.getElementById("logout-form");

if (form) {
  document.getElementById("log-out").addEventListener("click", function () {
    form.submit();
  });
}

$("img").error(function () {
  $(this).unbind("error").attr("src", "../images/profile.png");
});
