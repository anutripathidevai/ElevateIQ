-- Phase 2 career modules: Company Question Bank, STAR stories, Panel interviews.

-- CreateTable
CREATE TABLE "QuestionBookmark" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionBookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "status" "ProgressStatus" NOT NULL DEFAULT 'TODO',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StarStory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "situation" TEXT NOT NULL,
    "task" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "skills" TEXT[],
    "leadershipPrinciples" TEXT[],
    "suggestedQuestions" TEXT[],
    "tags" TEXT[],
    "sourceProject" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StarStory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PanelInterview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "focus" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "transcript" JSONB NOT NULL DEFAULT '[]',
    "result" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PanelInterview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuestionBookmark_userId_idx" ON "QuestionBookmark"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionBookmark_userId_questionId_key" ON "QuestionBookmark"("userId", "questionId");

-- CreateIndex
CREATE INDEX "QuestionProgress_userId_idx" ON "QuestionProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionProgress_userId_questionId_key" ON "QuestionProgress"("userId", "questionId");

-- CreateIndex
CREATE INDEX "StarStory_userId_idx" ON "StarStory"("userId");

-- CreateIndex
CREATE INDEX "PanelInterview_userId_idx" ON "PanelInterview"("userId");

-- AddForeignKey
ALTER TABLE "QuestionBookmark" ADD CONSTRAINT "QuestionBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionProgress" ADD CONSTRAINT "QuestionProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StarStory" ADD CONSTRAINT "StarStory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PanelInterview" ADD CONSTRAINT "PanelInterview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
