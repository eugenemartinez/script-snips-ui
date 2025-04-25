<template>
  <form @submit.prevent="submitForm" class="space-y-6">
    <!-- Title - Use computed property for v-model -->
    <BaseInput
      id="title"
      label="Title (Optional)"
      v-model="formTitle"
      placeholder="e.g., The Interrogation"
      :error="null"
    />

    <!-- Characters -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Characters</label>
      <div v-for="(_character, index) in formData.characters" :key="index" class="mb-2">
        <div class="flex items-center space-x-2">
            <!-- Replace Character Input with BaseInput -->
            <BaseInput
              :id="'character-' + index"
              v-model="formData.characters[index]"
              @blur="validateCharacter(index)"
              required
              placeholder="Character Name"
              :error="validationErrors.characters[index]"
              class="flex-grow"
            />
            <!-- Remove Character Button (remains the same) -->
            <Button
              variant="ghost-danger"
              type="button"
              @click="removeCharacter(index)"
              :disabled="formData.characters.length <= 1"
              aria-label="Remove Character"
            >
              &times;
            </Button>
        </div>
        <!-- Error message is now handled by BaseInput -->
      </div>
      <!-- Add Character Button (remains the same) -->
      <Button
        variant="link"
        type="button"
        @click="addCharacter"
        class="mt-1"
      >
        + Add Character
      </Button>
    </div>

    <!-- Lines -->
    <div>
       <label class="block text-sm font-medium text-gray-700 mb-1">Lines</label>
       <div v-for="(line, index) in formData.lines" :key="index" class="border border-gray-200 rounded-md p-3 mb-3 space-y-2 bg-gray-50 relative">
         <!-- Remove Line Button (remains the same) -->
         <Button
            variant="ghost-danger"
            type="button"
            @click="removeLine(index)"
            :disabled="formData.lines.length <= 1"
            class="absolute top-1 right-1"
            aria-label="Remove Line"
          >
             &times;
          </Button>

         <!-- Character Select - Replace with BaseSelect -->
         <BaseSelect
            :id="'speaker-' + index"
            label="Character"
            v-model="line.character"
            :options="characterOptions"
            placeholder="Select Character"
            required
            @change="validateLineCharacter(index)"
            :error="validationErrors.lines[index]?.character"
          />

         <!-- Dialogue Textarea - Use BaseTextarea -->
         <BaseTextarea
            :id="'dialogue-' + index"
            label="Dialogue"
            v-model="line.dialogue"
            @blur="validateLineDialogue(index)"
            required
            :rows="2"
            placeholder="Enter dialogue here..."
            :error="validationErrors.lines[index]?.dialogue"
          />
       </div>
       <!-- Add Line Button (remains the same) -->
       <Button
          variant="link"
          type="button"
          @click="addLine"
          class="mt-1"
        >
          + Add Line
        </Button>
    </div>

    <!-- Submission Error Display (remains the same) -->
    <alert-message
      :message="props.error ?? null"
      type="error"
      :show="!!props.error"
      @dismiss="handleDismissError"
      dismissible
      class="mb-4"
    />

    <!-- Form Actions (remains the same) -->
    <div class="flex justify-end space-x-3 pt-4">
       <Button
        variant="secondary"
        type="button"
        @click="cancelForm"
        :disabled="isSubmitting"
      >
        Cancel
      </Button>
      <Button
        variant="primary"
        type="submit"
        :loading="isSubmitting"
        :disabled="isSubmitting"
      >
        {{ submitText }}
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
// Ensure all these are imported from 'vue'
import { reactive, computed, watch, onMounted } from 'vue';
// Ensure ScriptFormData is imported (adjust path if necessary)
import type { ScriptFormData } from '../services/apiService';
import AlertMessage from './AlertMessage.vue';
import Button from './common/Button.vue';
import BaseInput from './common/BaseInput.vue';
import BaseTextarea from './common/BaseTextarea.vue';
import BaseSelect from './common/BaseSelect.vue'; // <-- Import BaseSelect

// --- Props ---
const props = defineProps<{
  initialData?: ScriptFormData; // Use imported type
  isSubmittingExternal?: boolean;
  error?: string | null;
  submitButtonText?: string; // Optional text for the submit button
}>();

// --- Emits ---
const emit = defineEmits(['submit', 'cancel', 'dismiss-error']);

// --- Reactive State ---
// formData and validationErrors should now work with 'reactive' imported
const formData = reactive<ScriptFormData>({
  title: '',
  characters: [''],
  lines: [{ character: '', dialogue: '' }],
});

const validationErrors = reactive<{
    characters: string[];
    lines: { character: string; dialogue: string }[];
}>({
    characters: [],
    lines: [],
});


// --- Computed Properties ---
// These should now work with 'computed' imported
const isSubmitting = computed(() => props.isSubmittingExternal ?? false);
const submitText = computed(() => props.submitButtonText || 'Submit Script');

const formTitle = computed({
  get: () => formData.title ?? '',
  set: (value: string) => { formData.title = value; } // Add type to 'value'
});

const availableCharacters = computed(() => {
  return formData.characters.map(c => c.trim()).filter(c => c !== '');
});

const characterOptions = computed(() => {
  // Add type to 'char'
  return availableCharacters.value.map((char: string) => ({
    value: char,
    text: char,
  }));
});

// --- Methods ---

// --- Individual Validation Methods ---
// Add types to parameters where needed (e.g., in filter/map callbacks)
const validateCharacter = (index: number) => {
    if (!formData.characters[index]?.trim()) {
        validationErrors.characters[index] = 'Character name cannot be empty.';
        return false;
    }
    const currentNameLower = formData.characters[index].trim().toLowerCase();
    const otherNamesLower = formData.characters
        .filter((_, i: number) => i !== index) // Add type to 'i'
        .map((name: string) => name.trim().toLowerCase()); // Add type to 'name'
    if (otherNamesLower.includes(currentNameLower)) {
         validationErrors.characters[index] = 'Character name must be unique.';
         return false;
    }
    validationErrors.characters[index] = '';
    return true;
};

const validateLineCharacter = (index: number) => {
    if (!formData.lines[index]?.character) {
        validationErrors.lines[index].character = 'Please select a character.';
        return false;
    }
    const available = formData.characters.map((c: string) => c.trim()).filter((c: string) => c); // Add types
    if (!available.includes(formData.lines[index].character)) {
        validationErrors.lines[index].character = 'Selected character is no longer valid.';
        return false;
    }
    validationErrors.lines[index].character = '';
    return true;
};

const validateLineDialogue = (index: number) => {
    if (!formData.lines[index]?.dialogue?.trim()) {
        validationErrors.lines[index].dialogue = 'Dialogue cannot be empty.';
        return false;
    }
    validationErrors.lines[index].dialogue = '';
    return true;
};

// --- Form Initialization and Management ---

const initializeForm = (data: ScriptFormData | undefined) => {
    const charCount = data?.characters?.length || 1;
    const lineCount = data?.lines?.length || 1;
    validationErrors.characters = Array(charCount).fill('');
    validationErrors.lines = Array(lineCount).fill(null).map(() => ({ character: '', dialogue: '' }));

    if (data) {
        formData.title = data.title || '';
        formData.characters = data.characters && data.characters.length > 0 ? [...data.characters] : [''];
        formData.lines = data.lines && data.lines.length > 0 ? data.lines.map(line => ({ ...line })) : [{ character: '', dialogue: '' }];
    } else {
        formData.title = '';
        formData.characters = [''];
        formData.lines = [{ character: '', dialogue: '' }];
    }
};

const addCharacter = () => {
  formData.characters.push('');
  validationErrors.characters.push('');
};

const removeCharacter = (index: number) => {
  if (formData.characters.length > 1) {
    const removedChar = formData.characters[index];
    formData.characters.splice(index, 1);
    validationErrors.characters.splice(index, 1);

    // Add types to parameters
    formData.lines.forEach((line: { character: string; dialogue: string }, lineIndex: number) => {
        if (line.character === removedChar) {
            line.character = '';
        }
        validateLineCharacter(lineIndex);
    });
  }
};

const addLine = () => {
  formData.lines.push({ character: '', dialogue: '' });
  validationErrors.lines.push({ character: '', dialogue: '' });
};

const removeLine = (index: number) => {
  if (formData.lines.length > 1) {
    formData.lines.splice(index, 1);
    validationErrors.lines.splice(index, 1);
  }
};

// --- Main Validation (Submit Time) ---
const validateForm = (): boolean => {
    let isOverallValid = true;

    // Add types
    formData.characters.forEach((_: string, index: number) => {
        if (!validateCharacter(index)) {
            isOverallValid = false;
        }
    });

    // Add type
    const validCharacters = formData.characters.filter((c: string) => c.trim() !== '');
    if (validCharacters.length === 0 && isOverallValid) {
        // Add type
        const firstEmptyIndex = validationErrors.characters.findIndex((err: string) => !err);
        if (firstEmptyIndex !== -1) {
             validationErrors.characters[firstEmptyIndex] = 'Please add at least one character name.';
        }
        isOverallValid = false;
    }

    // Add types
    formData.lines.forEach((_: { character: string; dialogue: string }, index: number) => {
        const isCharValid = validateLineCharacter(index);
        const isDialogueValid = validateLineDialogue(index);
        if (!isCharValid || !isDialogueValid) {
            isOverallValid = false;
        }
    });

    return isOverallValid;
};

const submitForm = () => {
  if (!validateForm()) {
    return;
  }

  const submissionData: ScriptFormData = {
    title: (formData.title || '').trim() || undefined,
    // Add type
    characters: formData.characters.filter((c: string) => c.trim() !== ''),
    // Add type
    lines: formData.lines.map((line: { character: string; dialogue: string }) => ({
        character: line.character,
        dialogue: line.dialogue.trim()
    }))
  };

  emit('submit', submissionData);
};

const cancelForm = () => {
  emit('cancel');
};

// --- Error Handling ---
const handleDismissError = () => {
  emit('dismiss-error');
};

// --- Lifecycle Hooks ---
// These should now work with 'onMounted' and 'watch' imported
onMounted(() => {
    initializeForm(props.initialData);
});

watch(() => props.initialData, (newData: ScriptFormData | undefined) => { // Add type
    initializeForm(newData);
}, { deep: true });

</script>