import { AnimatePresence, motion } from 'framer-motion'
import RecommendationCard from './RecommendationCard'

const cardVariants = {
  initial: { opacity: 0, y: -40 },
  animate: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.13 }
  }),
  exit: (i) => ({
    opacity: 0,
    y: 40,
    transition: { duration: 0.3, delay: i * 0.13 }
  })
};

const RecommendationGrid = ({ recommendations, getSourceInfo, loading }) => {
  if (loading || recommendations.length === 0) return null;

  return (
    <div className="recommendations-grid">
      <AnimatePresence mode="wait">
        {recommendations.map((item, i) => (
          <motion.div
            key={item.id}
            custom={i}
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            layout
          >
            <RecommendationCard item={item} getSourceInfo={getSourceInfo} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default RecommendationGrid; 