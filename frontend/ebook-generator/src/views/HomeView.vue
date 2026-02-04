<script setup>
import { ref, onMounted } from 'vue'
import { generateEbook, downloadEbook } from '../services/ebookService.js'
import InputField from '@/components/InputField.vue'
import CloseIcon from '@/icons/closeIcon.vue'
import TextArea from '@/components/TextArea.vue'
import InputFieldArray from '@/components/InputFieldArray.vue'

const book = ref({
  URL: '',
  TITLE: '',
  COVER: 'div.entry-content img',
  DESCRIPTION: '',
  CHAPTERURL: '',
  NUMCHAP: '',
  TITLECHAP: '',
  CONTENT: 'div.entry-content > p',
  IMG: 'div.entry-content img',
  LOGIN_FORM_API: 'form.post-password-form',
  PASSWORD_FIELD: "input[name='post_password']",
  PASSWORDS: [''],
})
const metadata = ref({
  '--title': '',
  '--authors': '',
  '--tags': '',
})
const isGenerated = ref(false)
const isLoading = ref(false);
const generateBtnLabel = ref('Generate Ebook');
const downloadBtnLabel = ref('Download');

async function submit() {
  try {
    isLoading.value = true;
    localStorage.setItem('book', JSON.stringify(book.value))
    localStorage.setItem('metadata', JSON.stringify(metadata.value))

    const res = await generateEbook(book.value, metadata.value)

    if (res.status === 200) {
      isGenerated.value = true
      generateBtnLabel.value = 'Re-generate Ebook'
    }
  } catch (err) {
    console.log(err.message)
  } finally {
    isLoading.value = false;
  }
}

const passwordSectionIsOpened = ref(false)

function openPasswordOption() {
  passwordSectionIsOpened.value = true;
}

function closePasswordOption() {
  passwordSectionIsOpened.value = false;
}

function handleDownload() {
  const link = document.createElement('a')

  link.href = 'http://localhost:3000/api/download-ebook'
  link.download = 'newBook.epub'
  document.body.appendChild(link)
  link.click()
  downloadBtnLabel.value = 'Downloaded !';
  document.body.removeChild(link)
}

onMounted(() => {
  if (localStorage.book) book.value = JSON.parse(localStorage.book)

  if (localStorage.metadata) metadata.value = JSON.parse(localStorage.metadata)
})
</script>

<template>
  <main>
    <div class="action-section">
      <button v-if="!isLoading" @click.stop.prevent="submit">{{ generateBtnLabel }}</button>

      <span v-if="isLoading" class="loader"></span>

      <button v-if="!isLoading && isGenerated" @click="handleDownload">{{ downloadBtnLabel }}</button>
    </div>
    <form>
      <div class="section">

        <div class="sub-section">
          <h3 class="sub-section-title">Enter Metadata</h3>
          <InputField label="Title" name="titleMetadata" v-model="metadata['--title']" />
          <InputField label="Author" name="author" v-model="metadata['--authors']" />
          <InputField label="Tags" name="tags" v-model="metadata['--tags']" />
        </div>


        <div class="sub-section">
          <h3 class="sub-section-title">Enter Book query</h3>
          <InputField label="Url" name="url" v-model="book.URL" />
          <InputField label="Cover Book Query" name="coverQuery" v-model="book.COVER" />
          <TextArea label="Description" name="description" v-model="book.DESCRIPTION" />
          <InputField label="Chapter Query" name="chapterQuery" v-model="book.CHAPTERURL" />
        </div>
      </div>

      <div class="section">
        <div class="sub-section">
          <h3 class="sub-section-title">Enter Chapter query</h3>
          <InputField label="Chapter Number Query" name="numChapQuery" v-model="book.NUMCHAP" />
          <InputField label="Title Chapter Query" name="titleChapQuery" v-model="book.TITLECHAP" />
          <InputField label="Content Chapter Query" name="contentChapQuery" v-model="book.CONTENT" />
          <InputField label="Image Chapter Query" name="imageQuery" v-model="book.IMG" />
        </div>

        <button v-if="!passwordSectionIsOpened" type="button" @click="openPasswordOption">This book has private contents
          ?</button>

        <div class="sub-section" v-show="passwordSectionIsOpened">
          <h3 class="sub-section-title">Handle Password</h3>
          <button v-if="passwordSectionIsOpened" class="sub-section-close" type="button" @click="closePasswordOption">
            <CloseIcon />
          </button>
          <InputField label="Password Form Query" name="passwordForm" v-model="book.LOGIN_FORM_API" />
          <InputField label="Password Input Query" name="passwordInputQuery" v-model="book.PASSWORD_FIELD" />

          <InputFieldArray v-model="book.PASSWORDS" label="Password" name="password" />

        </div>
      </div>
    </form>
  </main>
</template>

<style lang="scss" scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 2rem;

  @media (min-width: 1024px) {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);  /* ✅ Cho phép shrink = 0 */
  width: 100%;  /* Đầy parent */
  gap: 1rem;

  }

  .section {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .sub-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    position: relative;
    padding: 1rem;
    border-radius: 4px;
    border: 1px solid hsla(160, 100%, 37%, 1);

    &-title {
      position: absolute;
      top: -1rem;
      padding: 0 1rem;
      background: var(--color-background);
      font-weight: 500;
    }

    &-close {
      all: unset;
      cursor: pointer;
      position: absolute;
      top: -1rem;
      right: 2rem;
      padding: 0 1rem;
      background: var(--color-background);
      color: hsla(160, 100%, 37%, 1);
      font-weight: 500;

      &:hover {
        color: red;
      }
    }
  }
}

.action-section {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  min-height: 5rem;
}
</style>
