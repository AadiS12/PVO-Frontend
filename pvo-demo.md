---
layout: page
title: PVO API Demo
permalink: /pvo-demo/
---

<h1>PVO Frontend–Backend Demo</h1>

<p id="result">Connecting to backend...</p>

<script type="module">
import { pythonURI } from '{{site.baseurl}}/assets/js/api/config.js';

async function testConnection() {
  const result = document.getElementById("result");

  try {
    const response = await fetch(`${pythonURI}/api/pvo-demo`);

    if (!response.ok) {
      throw new Error("Backend request failed");
    }

    const data = await response.json();
    result.textContent = data.message;
  } catch (error) {
    result.textContent = "Unable to connect to backend.";
    console.error(error);
  }
}

testConnection();
</script>