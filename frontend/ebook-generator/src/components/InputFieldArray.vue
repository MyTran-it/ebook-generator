<script setup>
import AddIcon from '@/icons/addIcon.vue';
import TrashIcon from '@/icons/trashIcon.vue';
import { defineProps, defineModel, ref } from 'vue';

const props = defineProps({
    listInput: {
        type: Array,
        default: () => []
    },
    label: { type: String, default: '' },
    name: { type: String, default: '' },
    type: { type: String, default: 'text' }
});

// v-model 2-way bind array
const modelValue = defineModel('modelValue', { default: () => [] });

// Local reactive copy (để add/remove mượt)
const localItems = ref(props.listInput.length ? props.listInput : modelValue.value);

const addItem = () => {
    localItems.value.push('');  // Add empty input
    modelValue.value = localItems.value;  // Sync 2-way
};

const removeItem = (index) => {
    localItems.value.splice(index, 1);
    modelValue.value = localItems.value;
};
</script>

<template>
    <div v-for="(item, index) in localItems" :key="index" class="input-field">
        <label :for="`${name}-${index}`">
            {{ label }} {{ index + 1 }}
        </label>
        <div class="input-group">
            <input :type="type" :name="`${name}-${index}`" v-model="localItems[index]" />
            <button type="button" @click.stop="removeItem(index)" class="remove-btn">
                <TrashIcon />
            </button>
        </div>
    </div>

    <button type="button" @click.stop="addItem" class="add-btn">
        <AddIcon />
    </button>
</template>

<style scoped lang="scss">
.add-btn {
    align-items: center;
}

.input-group {
    display: flex;
    gap: 1rem;

    input {
        flex-grow: 1;
    }

    .remove-btn {
        all: unset;
        height: 37px;
        width: 37px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        border-radius: 4px;
        background-color: hsla(0, 72%, 61%, 0.8);
        color: var(--vt-c-text-dark-1);

        &:hover {
            background-color: hsla(0, 72%, 61%, 1);
        }
    }
}
</style>
