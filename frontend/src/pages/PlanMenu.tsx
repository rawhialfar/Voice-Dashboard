import { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Container,
  useTheme,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Chip,
  Collapse
} from '@mui/material';
import {
  Check as CheckIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import SubscriptionForm from '../components/Stripe/SubscriptionForm';
import { usePlans } from '../components/Plans';

const PlanMenu = () => {
  const theme = useTheme();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState({});
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const plans = usePlans();

  const toggleExpand = (planName: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [planName]: !prev[planName]
    }));
  };

  const handlePlanSelect = (planName: string) => {
    setSelectedPlan(planName);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = () => {
    console.log(`Successfully subscribed to ${selectedPlan}`);
    
    setShowPaymentForm(false);
    setSelectedPlan(null);
  };

  const handleClosePaymentForm = () => {
    setShowPaymentForm(false);
    setSelectedPlan(null);
  };

  const handleBackFromPayment = () => {
    setShowPaymentForm(false);
    setSelectedPlan(null);
  };

  return (
    <>
      <Container maxWidth="2xl" sx={{ py: 4 }}>
        {/* Header Section */}
        <Box textAlign="center" mb={6}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 700,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent'
            }}
          >
            Choose Your Plan
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ mx: 'auto', mb: 2  }}
          >
            Competitive, transparent pricing that combines the best features of leading platforms
          </Typography>
          <Chip 
            label="14-day free trial on all plans" 
            color="primary" 
            variant="outlined"
          />
        </Box>

        {/* Plans Grid */}
        <Grid container spacing={3} justifyContent="center" alignItems="stretch">
          {plans.map((plan) => {
            const isExpanded = expandedCards[plan.name];
            const initialFeaturesCount = 4; // Number of features to show initially
            const showReadMore = plan.features.length > initialFeaturesCount;

            return (
              <Grid item xs={12} sm={6} md={3} key={plan.name} sx={{ display: 'flex' }}>
                <Box 
                  sx={{ 
                    position: 'relative',
                    width: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    }
                  }}
                >
                  <Card 
                    sx={{ 
                      position: 'relative',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      borderRadius: 2,
                      border: plan.popular ? `15px solid ${plan.popularColor}` : `1px solid ${theme.palette.divider}`,
                      '&:hover': {
                        boxShadow: theme.shadows[8],
                      }
                    }}
                  >
                    {/* Ribbon */}
                    {plan.popular && (
                      <Box
                        sx={{
                          position: 'absolute',
                          left: -18,
                          transition: 'all 0.3s ease',
                          backgroundColor: plan.popularColor,
                          color: 'white',
                          width: 170,
                          height: 120,
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'flex-end',
                          transform: 'rotate(-45deg)',
                          transformOrigin: 'bottom left',
                        }}
                      >
                        <Typography
                          sx={{
                            textAlign: 'center',
                            textTransform: 'uppercase',
                            fontWeight: 700,
                            fontSize: '1rem',
                            width: 120,
                            letterSpacing: '0.5px',
                            marginTop: 8,
                            marginRight: 1.6,
                          }}
                        >
                          Most Popular
                        </Typography>
                      </Box>
                    )}

                    <CardContent sx={{ 
                      p: 3, 
                      flexGrow: 1, 
                      display: 'flex', 
                      flexDirection: 'column',
                      pt: plan.popular ? 5 : 3
                    }}>
                      {/* Plan Header */}
                      <Box textAlign="center" mb={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                          {plan.icon}
                          <Typography variant="h5" component="h2" sx={{ ml: 1, fontWeight: 600 }}>
                            {plan.name}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {plan.description}
                        </Typography>
                      </Box>

                      {/* Pricing */}
                      <Box textAlign="center" mb={2}>
                        <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: plan.color }}>
                          {plan.price}
                        </Typography>
                        <Typography variant="body1" fontWeight="600" color="text.primary" gutterBottom>
                          {plan.minutes}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {plan.overageRate}
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      {/* Features List with Read More */}
                      <Box sx={{ flexGrow: 1, mb: 2 }}>
                        <List dense>
                          {plan.features.slice(0, isExpanded ? plan.features.length : initialFeaturesCount).map((feature, index) => (
                            <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                <CheckIcon sx={{ color: plan.color, fontSize: 20 }} />
                              </ListItemIcon>
                              <ListItemText 
                                primary={feature} 
                                primaryTypographyProps={{ variant: 'body2' }}
                              />
                            </ListItem>
                          ))}
                        </List>

                        {/* Read More Button */}
                        {showReadMore && (
                          <Box textAlign="center" mt={1}>
                            <Button
                              size="small"
                              onClick={() => toggleExpand(plan.name)}
                              endIcon={
                                <ExpandMoreIcon 
                                  sx={{ 
                                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.3s ease'
                                  }} 
                                />
                              }
                              sx={{
                                color: plan.color,
                                fontWeight: 600,
                                '&:hover': {
                                  backgroundColor: `${plan.color}10`
                                }
                              }}
                            >
                              {isExpanded ? 'Show Less' : `+${plan.features.length - initialFeaturesCount} more`}
                            </Button>
                          </Box>
                        )}
                      </Box>

                      {/* Add-ons (Collapsible) */}
                      {plan.addons && (
                        <Collapse in={isExpanded} timeout="auto">
                          <Paper 
                            variant="outlined" 
                            sx={{ 
                              p: 1.5, 
                              mb: 2, 
                              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
                            }}
                          >
                            <Typography variant="caption" fontWeight="600" display="block" gutterBottom>
                              Add-ons:
                            </Typography>
                            {plan.addons.map((addon, index) => (
                              <Typography key={index} variant="caption" display="block" color="text.secondary">
                                • {addon}
                              </Typography>
                            ))}
                          </Paper>
                        </Collapse>
                      )}

                      {/* Premium Features (Collapsible) */}
                      {plan.premiumFeatures && (
                        <Collapse in={isExpanded} timeout="auto">
                          <Paper 
                            variant="outlined" 
                            sx={{ 
                              p: 1.5, 
                              mb: 2, 
                              borderColor: theme.palette.warning.main,
                              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,193,7,0.05)' : 'rgba(255,193,7,0.05)'
                            }}
                          >
                            <Typography variant="caption" fontWeight="600" display="block" gutterBottom color="warning.main">
                              Premium Features:
                            </Typography>
                            {plan.premiumFeatures.map((feature, index) => (
                              <Typography key={index} variant="caption" display="block" color="text.secondary">
                                • {feature}
                              </Typography>
                            ))}
                          </Paper>
                        </Collapse>
                      )}

                      {/* Choose Button */}
                      <Button
                        variant={selectedPlan === plan.name ? "contained" : "outlined"}
                        size="large"
                        fullWidth
                        sx={{
                          mt: 'auto',
                          py: 1.5,
                          fontWeight: 600,
                          backgroundColor: selectedPlan === plan.name ? plan.color : 'transparent',
                          borderColor: plan.color,
                          color: selectedPlan === plan.name ? 'white' : plan.color,
                          '&:hover': {
                            backgroundColor: selectedPlan === plan.name ? plan.color : `${plan.color}10`,
                            borderColor: plan.color
                          }
                        }}
                        onClick={() => handlePlanSelect(plan.name)}
                      >
                        {plan.buttonText}
                      </Button>
                        
                    </CardContent>
                  </Card>
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {/* Pricing Comparison */}
        <Box mt={6} textAlign="center">
          <Typography variant="h5" gutterBottom fontWeight="600">
            💰 Better Value Than Individual Platforms
          </Typography>
          <Grid container spacing={2} justifyContent="center" mt={2}>
            <Grid item xs={12} md={8}>
              <Paper elevation={1} sx={{ p: 3 }}>
                <Typography variant="body1" paragraph>
                  <strong>Why our pricing wins:</strong>
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">• Lower per-minute rates than individual vendors</Typography>
                    <Typography variant="body2">• Transparent flat-rate bundles → predictable billing</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">• Scalable plans for startups to enterprises</Typography>
                    <Typography variant="body2">• Premium support & customization included</Typography>
                  </Grid>
                </Grid>
                <Box textAlign="center" mt={2}>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Need help choosing? <Button color="primary" href='mailto:Support@genovation.ai'>Contact our sales team</Button>
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* Subscription Form Dialog */}
      {showPaymentForm && (
        <SubscriptionForm
          open={showPaymentForm}
          plan={plans.find(p => p.name === selectedPlan)}
          onBack={handleBackFromPayment}
          onClose={handleClosePaymentForm}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
};

export default PlanMenu;