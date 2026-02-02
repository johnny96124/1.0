import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';

interface FaqFeedbackProps {
  faqId: string;
  feedbackGiven: Record<string, 'helpful' | 'not_helpful' | undefined>;
  onFeedback: (faqId: string, helpful: boolean) => void;
}

export function FaqFeedback({ faqId, feedbackGiven, onFeedback }: FaqFeedbackProps) {
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comment, setComment] = useState('');
  
  const currentFeedback = feedbackGiven[faqId];

  const handleHelpful = () => {
    onFeedback(faqId, true);
    toast.success('感谢您的反馈！');
  };

  const handleNotHelpful = () => {
    onFeedback(faqId, false);
    setShowCommentBox(true);
  };

  const handleSubmitComment = () => {
    if (comment.trim()) {
      toast.success('感谢您的宝贵意见！');
      setComment('');
      setShowCommentBox(false);
    }
  };

  if (currentFeedback === 'helpful') {
    return (
      <div className="flex items-center gap-2 pt-3 mt-3 border-t border-border/50">
        <ThumbsUp className="w-4 h-4 text-primary" />
        <span className="text-xs text-muted-foreground">感谢您的反馈</span>
      </div>
    );
  }

  if (currentFeedback === 'not_helpful' && !showCommentBox) {
    return (
      <div className="flex items-center gap-2 pt-3 mt-3 border-t border-border/50">
        <ThumbsDown className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">感谢您的反馈</span>
      </div>
    );
  }

  return (
    <div className="pt-3 mt-3 border-t border-border/50">
      <AnimatePresence mode="wait">
        {!currentFeedback && (
          <motion.div
            key="buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3"
          >
            <span className="text-xs text-muted-foreground">这篇文章对您有帮助吗？</span>
            <div className="flex gap-2">
              <button
                onClick={handleHelpful}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors',
                  'bg-muted hover:bg-primary/10 hover:text-primary'
                )}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                有帮助
              </button>
              <button
                onClick={handleNotHelpful}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors',
                  'bg-muted hover:bg-destructive/10 hover:text-destructive'
                )}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                无帮助
              </button>
            </div>
          </motion.div>
        )}

        {showCommentBox && (
          <motion.div
            key="comment"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <p className="text-xs text-muted-foreground">请告诉我们如何改进：</p>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="您的建议..."
              className="min-h-[60px] text-sm"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCommentBox(false)}
              >
                跳过
              </Button>
              <Button
                size="sm"
                onClick={handleSubmitComment}
                disabled={!comment.trim()}
                className="gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                提交
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
