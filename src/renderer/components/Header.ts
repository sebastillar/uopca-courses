class Header extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
            <header>
                <div class="bg-white border-b-2 p-4 flex justify-center items-center">
                    <img
                    class="h-4 w-auto"
                    src="../assets/uopca-logo.svg"
                    alt="UOPCA Logo"
                    />
                </div>
            </header>`
  }
}

customElements.define("app-header", Header)
