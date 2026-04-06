import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { checkQuizStatus, getQuizByLessonId, submitQuiz as submitQuizService } from '../services/quizService';

// Interfaces for our quiz data structures
export interface QuestionOption {
  id: number;
  content: string;
}

export interface Question {
  id: number;
  content: string;
  question_type: 'multiple_choice' | 'true_false';
  options: QuestionOption[];
}

export interface Quiz {
  id: number;
  lesson_id: number;
  title: string;
  questions: Question[];
}

export interface QuizResult {
  score: number;
  correctAnswers: { [key: number]: number };
  message: string;
}

interface QuizState {
  quiz: Quiz | null;
  result: QuizResult | null;
  loading: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

export interface QuizStatus {
  hasAttempted: boolean;
  highestScore: number | null;
  isPassed: boolean;
}

interface QuizState {
  quiz: Quiz | null;
  result: QuizResult | null;
  passedLessonQuizzes: { [lessonId: number]: boolean }; // MỚI: Lưu trạng thái pass theo lesson_id
  loading: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: QuizState = {
  quiz: null,
  result: null,
  passedLessonQuizzes: {},
  loading: 'idle',
  error: null,
};

export const fetchQuizStatus = createAsyncThunk<
  { lessonId: number, status: QuizStatus },
  number,
  { rejectValue: string }
>('quiz/fetchStatus', async (lessonId, { rejectWithValue }) => {
  try {
    const data = await checkQuizStatus(lessonId);
    return { lessonId, status: data };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue(error.message || 'Failed to fetch quiz status');
  }
});


// Async thunk to fetch a quiz by its lesson ID
export const fetchQuizByLessonId = createAsyncThunk<
  Quiz,
  number,
  { rejectValue: string }
>('quiz/fetchByLessonId', async (lessonId, { rejectWithValue }) => {
  try {
    const data = await getQuizByLessonId(lessonId);
    return data;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue(error.message || 'Failed to fetch quiz');
  }
});

// Async thunk to submit a quiz and get the results
export const submitQuiz = createAsyncThunk<
  QuizResult,
  { id: number; answers: { questionId: number; selectedOptionId: number }[] },
  { rejectValue: string }
>('quiz/submit', async ({ id, answers }, { rejectWithValue }) => {
  try {
    const data = await submitQuizService(id, answers);
    return data;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue(error.message || 'Failed to submit quiz');
  }
});

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    resetQuiz: (state) => {
      state.quiz = null;
      state.result = null;
      state.loading = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetching quiz
      .addCase(fetchQuizByLessonId.pending, (state) => {
        state.loading = 'loading';
        state.error = null;
      })
      .addCase(fetchQuizByLessonId.fulfilled, (state, action: PayloadAction<Quiz>) => {
        state.loading = 'succeeded';
        state.quiz = action.payload;
        state.result = null; // Reset result when a new quiz is fetched
      })
      .addCase(fetchQuizByLessonId.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload || 'Failed to fetch quiz';
      })
      // Submitting quiz
      .addCase(submitQuiz.pending, (state) => {
        state.loading = 'loading';
        state.error = null;
      })
      .addCase(submitQuiz.fulfilled, (state, action: PayloadAction<QuizResult>) => {
        state.loading = 'succeeded';
        state.result = action.payload;
      })
      .addCase(submitQuiz.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload || 'Failed to submit quiz';
      })
      .addCase(fetchQuizStatus.fulfilled, (state, action) => {
        const { lessonId, status } = action.payload;
        state.passedLessonQuizzes[lessonId] = status.isPassed;
      });
},
});

export const { resetQuiz } = quizSlice.actions;
export default quizSlice.reducer;
