class General {
    static shareInstance = new General();

    showLoader() {
        if (document.getElementById("loader")) {
            document.getElementById("loader").style.display = 'block';

        }
    }

    hideLoader() {
        if (document.getElementById("loader"))
            document.getElementById("loader").style.display = 'none';
    }
}
export default General;