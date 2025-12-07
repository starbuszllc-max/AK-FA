'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const AssessmentForm = dynamic(() => import('../../components/AssessmentForm'), {ssr: false});

export default function AssessmentsPage() {
  return (
    <div className="py-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          7-Layer Self Assessment
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore the seven dimensions of human development. Rate each layer honestly 
          to discover insights about your current state and identify areas for growth.
        </p>
      </div>
      
      <AssessmentForm />
    </div>
  );
}
