// import React, { useState } from 'react';
// import {
//   Button,
//   Card,
//   CardBody,
//   // CardFooter,
//   // CardHeader,
//   // CardImage,
//   Input,
//   Loader,
//   Modal,
// } from '@/components/common';
// import './Example.css';

// const Example: React.FC = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setTimeout(() => {
//       setIsLoading(false);
//       setIsModalOpen(true);
//     }, 2000);
//   };

//   return (
//     <>
//       {/* Main Content */}
//       <div className="container">
//         <h1 className="title">Common Components Showcase</h1>

//         {/* Buttons */}
//         <section className="section">
//           <h2 className="section-title">Buttons</h2>
//           <div className="button-group">
//             <Button variant="primary">Primary Button</Button>
//             <Button variant="primary" size="large">
//               Large Primary
//             </Button>
//             <Button variant="primary" size="small">
//               Small Primary
//             </Button>
//             <Button variant="secondary">Secondary Button</Button>
//             <Button variant="primary" disabled>
//               Disabled
//             </Button>
//             <Button variant="primary" loading>
//               Loading State
//             </Button>
//           </div>
//         </section>

//         {/* Cards */}
//         {/* <section className="section">
//           <h2 className="section-title">Cards</h2>
//           <div className="card-grid">
//             <Card>
//               <CardImage src="https://recipesblob.oetker.in/assets/c8f69e58cfc5442e856f28d1f197de4f/1272x764/maharaja-burger.webp" alt="Burger" />
//               <CardHeader>Featured Dish</CardHeader>
//               <CardBody>
//                 <h3>Classic Cheese Burger</h3>
//                 <p>Juicy beef patty with melted cheese, fresh lettuce, tomato, and our special sauce.</p>
//                 <strong style={{ fontSize: '1.25rem', color: '#ff6b35' }}>$12.99</strong>
//               </CardBody>
//               <CardFooter>
//                 <Button variant="primary" size="small">Add to Cart</Button>
//               </CardFooter>
//             </Card>

//             <Card compact noShadow>
//               <CardHeader>Simple Card</CardHeader>
//               <CardBody>
//                 <p>This is a compact card without shadow. Great for lists or settings.</p>
//               </CardBody>
//             </Card>
//           </div>
//         </section> */}

//         {/* Form */}
//         <section className="section">
//           <h2 className="section-title">Inputs & Form</h2>
//           <div className="form-wrapper">
//             <Card>
//               {/* <CardHeader>Login Form Example</CardHeader> */}
//               <CardBody>
//                 <form onSubmit={handleSubmit}>
//                   <Input
//                     label="Email Address"
//                     type="email"
//                     placeholder="you@example.com"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     required
//                   />
//                   <Input
//                     label="Password"
//                     type="password"
//                     placeholder="••••••••"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     helperText="Must be at least 6 characters"
//                     required
//                   />
//                   <Button
//                     variant="primary"
//                     size="medium"
//                     type="submit"
//                     loading={isLoading}
//                     style={{ width: '100%', marginTop: '10px' }}
//                   >
//                     Sign In
//                   </Button>
//                 </form>
//               </CardBody>
//             </Card>
//           </div>
//         </section>

//         {/* Loaders */}
//         <section className="section">
//           <h2 className="section-title">Loaders</h2>
//           <div className="loader-group">
//             <div className="loader-item">
//               <Loader size="small" />
//               <p>Small Spinner</p>
//             </div>
//             <div className="loader-item">
//               <Loader size="large" />
//               <p>Large Spinner</p>
//             </div>
//             <div className="loader-item">
//               <Loader type="dots" />
//               <p>Dots Animation</p>
//             </div>
//           </div>
//         </section>

//         {/* Modal Trigger */}
//         <section className="modal-trigger">
//           <Button variant="primary" size="large" onClick={() => setIsModalOpen(true)}>
//             Open Modal Manually
//           </Button>
//         </section>
//       </div>

//       {/* Modal - Sibling to main content */}
//       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Welcome Back!">
//         <p>You've successfully signed in with the demo form.</p>
//         <div style={{ marginTop: '24px', textAlign: 'right' }}>
//           <Button variant="primary" onClick={() => setIsModalOpen(false)}>
//             Got it!
//           </Button>
//         </div>
//       </Modal>

//       {/* Full-screen Loader - Always last, at root level */}
//       {isLoading && <Loader overlay />}
//     </>
//   );
// };

// export default Example;
