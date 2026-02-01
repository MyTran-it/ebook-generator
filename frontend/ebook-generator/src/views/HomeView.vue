<script setup>
import { ref, watch } from 'vue'
import { generateEbook, downloadEbook } from '../services/ebookService.js';
import { Book } from '@/models/book.interface.js';

const book = {
  URL: 'https://cuopbienmap.wordpress.com/2018/05/19/muc-luc-lang-gieng-2/',
  TITLE: 'div.entry-content h2',
  COVER: 'div.entry-content img',
  CHAPTERURL: 'div.entry-content > p a',
  NUMCHAP: 'h1.entry-title',
  TITLECHAP: 'div.entry-content > p strong, div.entry-content > p b',
  CONTENT: 'div.entry-content > p',
  IMG: 'div.entry-content img',
  LOGIN_FORM_API: 'form.post-password-form',
  PASSWORD_FIELD: "input[name='post_password']",
}

const metadata = {
  '--title': 'Láng Giềng',
  '--authors': 'ABC',
  '--tags': 'hahahaha',
  '--language': 'vi',
  '--toc-threshold': '0',
}

// const book = ref({
//   URL: '',
//   TITLE: '',
//   COVER: '',
//   DESCRIPTION: '',
//   CHAPTER: '',
//   NUMCHAP: '',
//   TITLECHAP: '',
//   CONTENT: '',
//   IMG: '',
//   LOGIN_FORM_API: '',
//   PASSWORD_FIELD: '',
//   PASSWORDS: [""]
// });
// const metadata = ref({
//   "--title": "",
//   "--authors": "",
//   "--tags": ""
// });
const isGenerated = ref(false)

async function submit() {
  try {

    // console.log(book.value, metadata.value);
    // return;

    const res = await generateEbook(book, metadata)

    if (res.status === 200) {
      isGenerated.value = true
    }
  } catch (err) {
    console.log(err.message)
  }
}

const passwordSectionIsOpened = ref(false)

function openPasswordOption() {
  passwordSectionIsOpened.value = !passwordSectionIsOpened.value
}

function handleDownload() {
  const link = document.createElement('a')

  link.href = 'http://localhost:3000/api/download-ebook'
  link.download = 'newBook.epub'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

</script>

<template>
  <main>
    <form>
      <div>
        <h3>Enter Book query</h3>
        <label for="url">Url:</label>
        <input type="text" name="url" v-model="book.URL" />

        <label for="titleQuery">Title query:</label>
        <input type="text" name="titleQuery" v-model="book.TITLE" />

        <label for="description">Description:</label>
        <textarea type="text" name="description" v-model="book.DESCRIPTION"></textarea>

        <label for="chapterQuery">Chapter query:</label>
        <input type="text" name="chapterQuery" v-model="book.CHAPTER" />

        <label for="">Chapter number query:</label>
        <input type="text" name="numChapQuery" v-model="book.NUMCHAP" />

        <label>Title chapter query:</label>
        <input type="text" name="titleChapQuery" v-model="book.TITLECHAP" />

        <label>Content chapter query:</label>
        <input type="text" name="contentChapQuery" v-model="book.CONTENT" />

        <label>Image query:</label>
        <input type="text" name="imageQuery" v-model="book.IMG" />

        <button type="button" @click="openPasswordOption">This book has private contents ?</button>

        <div v-show="passwordSectionIsOpened">
          <label>Password form query:</label>
          <input type="text" name="passwordForm" v-model="book.LOGIN_FORM_API" />

          <label>PASSWORD_FIELD</label>
          <input type="text" name="passwordInputQuery" v-model="book.PASSWORD_FIELD" />

          <div>
            <label for="passwordToCheck">Password to check:</label>
            <input v-for="(value, index) in book.PASSWORDS" type="text" :key="index" name="passwordToCheck"
              v-model="book.PASSWORDS[index]" />
            <button type="button" @click.prevent="() => {
              book.PASSWORDS.push('');
            }">
              Add
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3>Enter Metadata</h3>

        <label>Title:</label>
        <input type="text" name="title" />

        <label>Author:</label>
        <input type="text" name="author" />

        <label>Tags:</label>
        <input type="text" name="tags" />
      </div>
    </form>
    <button @click.stop.prevent="submit">Generate Ebook</button>
    <button v-if="isGenerated" @click="handleDownload">Download</button>
  </main>
</template>

<style scoped>
form {
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr 1fr;

  div {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
