export default {
  name: 'RevealSecret',
  data() {
    return {
      show: false,
      notFound: true,
      slug: "",
      secretText: "",
      expiresAt: 0,
      remainingViews: 0,
      shareableUrl: "",
    }
  },
  methods: {
    copy() {
      var copyText = document.getElementById("shareableUrl");

      /* Select the text field */
      copyText.select();

      /* Copy the text inside the text field */
      document.execCommand("copy");
    }
  },
  mounted() {
    this.slug = window.location.pathname.split("/secret/")[1]
    let request_url = '/api/v1/secret/' + this.slug

    axios
      .get(request_url)
      .then(res => {
        this.show = true;
        this.notFound = false;
        console.log("GET", res);
        this.secretText = res.data.secretText;
        this.expiresAt = res.data.expiresAt;
        this.remainingViews = res.data.remainingViews;
        this.shareableUrl = window.location.host + '/secret/' + res.data.hash;

        // Entire view has been rendered
        // Send a put request to backend to update the number of views
        if (this.remainingViews > 0) {

          axios
            .put(request_url)
            .then(res => {
              console.log("PUT", res);
              this.remainingViews = res.data.remainingViews;
            })
            .catch(err => {
              this.show = true;
              console.log(err)
            })
        }
      })
      .catch(err => {
        this.show = true;
        console.log(err)
      })

  },
  template: `
    <div id="reveal-secret" v-if="show">
      <div v-if="notFound">
        <h1>To infinity and beyond!</h1>
        <label class="info-label">404: secret not found or secret expired</label>
      </div>
      <div v-else>
        <label class="info-label">Your super secret message</label>
        <p class="secret-text">{{ secretText }}</p>

        <div class="row">
          <div class="six columns">
            <label class="info-text">{{ remainingViews }}</label>
            <label class="info-label">Views left</label>
          </div>

          <div class="six columns">
            <label class="info-text">{{ expiresAt }}</label>
            <label class="info-label">Minutes to expire</label>
          </div>
        </div>

        <div class="row share-link" v-if="shareableUrl">
          <label class="info-label">Shareable link</label>
          <div class="ten columns copy-row">
            <input id="shareableUrl" class="input u-full-width" type="text" v-model="shareableUrl" readonly="readonly">
          </div>
          <div class="one columns">
            <button @click="copy" class="button-enigma button-copy"><i class="fa fa-clipboard" aria-hidden="true"></i></button>
          </div>
        </div>
      </div>
    </div>
  `,
};
