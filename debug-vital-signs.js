const { parseTranscript } = require('./lib/intelligentTranscriptParser');

const jamesBondAudio = `Good morning, please have a seat. Let me start by confirming your information. Can you state your full name for me?
My name is James Bond.
And your age, Mr. Bond?
I'm 33 years old.
Thank you. I have you listed as male, is that correct?
Yes, that's correct.
Alright, let me take your vital signs first. The nurse mentioned she wasn't able to get all of them in triage. Let me check your temperature... okay, that's reading normal. Your pulse rate... hmm, I'm not getting a clear reading here, let me try again later. Your blood pressure... the cuff seems to be malfunctioning, we'll need to use a different one. And for your respiratory rate, you seem to be breathing normally, but I didn't count the exact rate. We'll also need to check your glucose level if needed later.
Is everything okay with the equipment?
Yes, just some technical issues today. We'll get proper readings if needed for your treatment.
Now, what brings you in today? What's the main concern or problem you're experiencing?
Well, doctor, I've been having weakness on the left side of my body, including my left arm and leg. I've also noticed some facial drooping on the left side. It's been really concerning me.
I see. When did you first notice these symptoms?
It started this morning when I woke up. The weakness was quite noticeable, and my family pointed out the facial drooping.
Let me get more details about what you've been experiencing. Can you tell me more about how these symptoms developed?
Well, like I said, I woke up this morning and immediately noticed something was wrong. The left side of my face felt different, and when I tried to get out of bed, my left leg felt weak and unsteady. My left arm also feels much weaker than usual.
Have you experienced anything like this before?
No, never anything like this. It came on suddenly overnight.
Any headaches, vision changes, or speech difficulties?
No headaches or vision problems. My speech seems okay, though my family said it sounds slightly different.
Any nausea, vomiting, or dizziness?
No, nothing like that.
Let me ask about your medical history. Do you have any ongoing medical conditions or have you had any significant illnesses in the past?
Not really, doctor. I've been pretty healthy overall. No major medical conditions that I'm aware of.
Any surgeries or hospitalizations?
No, none.
Any family history of stroke, heart disease, or other significant conditions?
My father had high blood pressure, but I'm not sure about anything else.
What medications are you currently taking, if any?
I don't take any regular medications, doctor. Just occasional over-the-counter pain relievers when needed.
Any allergies to medications or other substances?
Not that I'm aware of, no known allergies.
Any supplements or herbal remedies?
No, nothing like that.
I'd like to go through a quick review of systems. Any recent weight loss or gain?
No significant changes.
Any chest pain, shortness of breath, or heart palpitations?
No, nothing like that.
Any urinary problems, bowel changes?
No, everything seems normal there.
Any skin changes, joint pain, or other symptoms we haven't discussed?
No, just what I mentioned about the weakness and facial drooping.
Now I'm going to examine you. Let me start with a general observation... You appear alert and oriented, sitting comfortably. I can see some slight facial asymmetry on the left side. Let me check your reflexes and muscle strength.
Can you raise both arms for me? I notice your left arm has decreased strength compared to the right. Now let me test your leg strength... yes, there's definitely weakness on the left side.
Let me check your facial movements. Try to smile for me... I can see the left side of your mouth droops slightly. Can you close your eyes tightly? There's some weakness in your left eyelid closure as well.
Your heart sounds are regular, lungs sound clear. No obvious signs of distress other than the neurological symptoms we're observing.
Based on your symptoms and my examination, I'm quite concerned about what we're seeing here. The combination of sudden onset left-sided weakness affecting your face, arm, and leg, along with the facial drooping, is very concerning for a possible stroke or cerebrovascular accident.
A stroke? Is that serious?
Yes, this is a serious condition that requires immediate attention and further evaluation.
Here's what we need to do immediately. First, I'm going to order some urgent tests including a CT scan of your head to look at your brain, and some blood work. We may also need an MRI depending on the CT results.
I'm also going to start you on some medications right away, and we'll need to admit you to the hospital for monitoring and treatment. Time is critical with these types of symptoms.
We'll also need to get neurology involved - they're the specialists who deal with stroke and brain conditions. They'll probably want to see you within the hour.
Should I be worried?
We're taking this very seriously, but you're in the right place now. The most important thing is that we caught this early and can start treatment promptly.
As I mentioned, we'll be doing several tests - the CT scan, blood work, and likely an MRI. These will help us understand exactly what's happening and guide our treatment.
For the record, this is Dr. Gbenga Oluwadahunsi examining the patient. Today's date is August 21st, 2025, and the time is approximately 9:42 AM.
Do you have any questions for me right now, Mr. Bond?
What happens next?
The nursing staff will get you set up for those tests immediately, and I'll be monitoring your progress closely. We'll have more information once we get the test results back.
Thank you, doctor.
You're welcome. We're going to take good care of you.`;

console.log('=== TESTING ENHANCED PARSER ===');
try {
  const result = parseTranscript(jamesBondAudio);
  
  console.log('\n=== PATIENT INFO ===');
  console.log(JSON.stringify(result.patientInfo, null, 2));
  
  console.log('\n=== VITAL SIGNS ===');
  console.log(JSON.stringify(result.vitalSigns, null, 2));
  
  console.log('\n=== CHIEF COMPLAINT ===');
  console.log(result.chiefComplaint);
  
  console.log('\n=== ASSESSMENT ===');
  console.log(result.assessment);
  
  console.log('\n=== PLAN ===');
  console.log(result.plan);
  
  console.log('\n=== PROVIDER INFO ===');
  console.log(JSON.stringify(result.providerInfo, null, 2));
  
} catch (error) {
  console.error('Error:', error);
}